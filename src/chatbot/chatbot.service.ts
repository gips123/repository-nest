import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Folder, Role, User } from '../entities';
import { FoldersService } from '../folders/folders.service';
import { RolesService } from '../roles/roles.service';
import axios from 'axios';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ChatbotService {
  private readonly ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly model = process.env.OLLAMA_MODEL || 'llama2';

  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private foldersService: FoldersService,
    private rolesService: RolesService,
  ) {}

  async chat(user: User, message: string): Promise<string> {
    // Get context about folders
    const context = await this.getFolderContext(user);

    // Prepare system prompt
    const systemPrompt = this.buildSystemPrompt(user, context);

    // Call Ollama API
    const response = await this.callOllama(systemPrompt, message);

    return response;
  }

  private async getFolderContext(user: User) {
    // Get all folders (admin can see all, others see accessible + info about others)
    const allFolders = await this.folderRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['permissions', 'permissions.role', 'permissions.user'],
      order: { name: 'ASC' },
    });

    // Get accessible folders for this user
    const accessibleFolders = await this.foldersService.findAllAccessible(user);

    // Get all roles
    const roles = await this.rolesService.findAll();

    // Build folder information
    const folderInfo = allFolders.map((folder) => {
      const permissions = (folder as any).permissions || [];
      const rolePermissions = permissions
        .filter((p: any) => p.role_id)
        .map((p: any) => p.role?.name)
        .filter(Boolean);
      const userPermissions = permissions
        .filter((p: any) => p.user_id)
        .map((p: any) => p.user?.name)
        .filter(Boolean);

      const isAccessible = accessibleFolders.some((af) => af.id === folder.id);

      return {
        id: folder.id,
        name: folder.name,
        parent_id: folder.parent_id,
        accessible: isAccessible,
        roles_with_access: rolePermissions,
        users_with_access: userPermissions,
      };
    });

    return {
      folders: folderInfo,
      user_role: user.role?.name || 'unknown',
      all_roles: roles.map((r) => r.name),
    };
  }

  private buildSystemPrompt(user: User, context: any): string {
    const prompt = `You are a helpful assistant for a campus repository system. Your role is to help users find folders and understand folder permissions.

USER INFORMATION:
- User: ${user.name} (${user.email})
- Role: ${context.user_role}

AVAILABLE ROLES:
${context.all_roles.map((r: string) => `- ${r}`).join('\n')}

FOLDER INFORMATION:
${context.folders
  .map((f: any) => {
    const accessInfo = f.accessible
      ? `[ACCESSIBLE] User can access this folder`
      : `[NOT ACCESSIBLE] User cannot access this folder. Available to roles: ${f.roles_with_access.join(', ') || 'none'}`;
    return `- "${f.name}" (ID: ${f.id}) - ${accessInfo}`;
  })
  .join('\n')}

INSTRUCTIONS:
1. Help users find folders by name or description
2. If a folder exists but user doesn't have access, inform them:
   - Which role(s) have access to that folder
   - That they need to contact admin to request permission
   - Provide the folder name and suggest contacting admin
3. Be helpful and friendly
4. If folder doesn't exist, suggest similar folder names
5. Always respond in Indonesian (Bahasa Indonesia)

IMPORTANT:
- If user asks about a folder they don't have access to, tell them the folder exists and which role has access
- Always remind them to contact admin for permission requests
- Be concise but informative`;

    return prompt;
  }

  private async callOllama(systemPrompt: string, userMessage: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/chat`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          stream: false,
        },
        {
          timeout: 30000, // 30 seconds timeout
        },
      );

      // Ollama API response format
      const content = response.data?.message?.content || 
                     response.data?.content || 
                     response.data?.response ||
                     'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';
      
      return content;
    } catch (error) {
      console.error('Ollama API Error:', error);
      
      // Fallback response if Ollama is not available
      return this.getFallbackResponse(userMessage);
    }
  }

  private async getFallbackResponse(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('ijazah') ||
      lowerMessage.includes('ijasah') ||
      lowerMessage.includes('folder')
    ) {
      return `Saya sedang mengalami masalah teknis. Namun berdasarkan informasi sistem:

Untuk mencari folder "ijazah" atau folder lainnya, silakan:
1. Cek folder yang bisa Anda akses melalui menu folder
2. Jika folder tidak muncul, kemungkinan folder tersebut ada di role lain
3. Hubungi admin untuk meminta permission akses ke folder tersebut

Mohon maaf atas ketidaknyamanannya.`;
    }

    return 'Maaf, layanan chatbot sedang tidak tersedia. Silakan hubungi admin untuk bantuan lebih lanjut.';
  }

  async searchFolders(query: string, user: User) {
    const allFolders = await this.folderRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['permissions', 'permissions.role'],
      order: { name: 'ASC' },
    });

    // Filter by query
    const filteredFolders = allFolders.filter((folder) =>
      folder.name.toLowerCase().includes(query.toLowerCase()),
    );

    const accessibleFolders = await this.foldersService.findAllAccessible(user);
    const accessibleFolderIds = new Set(accessibleFolders.map((f) => f.id));

    const searchResults = filteredFolders.map((folder) => {
      const isAccessible = accessibleFolderIds.has(folder.id);
      const permissions = (folder as any).permissions || [];
      const rolePermissions = permissions
        .filter((p: any) => p.role_id)
        .map((p: any) => p.role?.name)
        .filter(Boolean);

        return {
          id: folder.id,
          name: folder.name,
          accessible: isAccessible,
          roles_with_access: rolePermissions,
          needs_admin_permission: !isAccessible && rolePermissions.length > 0,
        };
      });

    return searchResults;
  }
}

