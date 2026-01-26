# Example SQL Queries

This document contains example SQL queries that demonstrate how the folder tree and permission system works.

## Recursive Folder Tree Query

The sidebar tree endpoint uses a TypeORM-based approach, but here's the equivalent recursive SQL query that could be used:

### PostgreSQL Recursive CTE Approach

```sql
WITH RECURSIVE folder_tree AS (
  -- Base case: root folders (no parent)
  SELECT 
    f.id,
    f.name,
    f.parent_id,
    f.created_at,
    f.updated_at,
    0 as level,
    ARRAY[f.id] as path
  FROM folders f
  WHERE f.parent_id IS NULL
    AND f.deleted_at IS NULL
    AND f.id IN (
      -- Only include folders with read permission
      SELECT DISTINCT fp.folder_id
      FROM folder_permissions fp
      WHERE fp.can_read = true
        AND (fp.user_id = :userId OR fp.role_id = :roleId)
        AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
    )
  
  UNION ALL
  
  -- Recursive case: child folders
  SELECT 
    f.id,
    f.name,
    f.parent_id,
    f.created_at,
    f.updated_at,
    ft.level + 1,
    ft.path || f.id
  FROM folders f
  INNER JOIN folder_tree ft ON f.parent_id = ft.id
  WHERE f.deleted_at IS NULL
    AND NOT (f.id = ANY(ft.path)) -- Prevent cycles
    AND f.id IN (
      SELECT DISTINCT fp.folder_id
      FROM folder_permissions fp
      WHERE fp.can_read = true
        AND (fp.user_id = :userId OR fp.role_id = :roleId)
        AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
    )
)
SELECT * FROM folder_tree
ORDER BY level, name;
```

### TypeORM Implementation (Current)

The current implementation uses TypeORM with a two-pass approach:

1. **First Pass**: Fetch all accessible folders
2. **Second Pass**: Build the tree structure in memory

This approach is more flexible and easier to maintain, though the recursive SQL approach can be more efficient for very deep hierarchies.

## Permission Check Query

Check if a user has a specific permission on a folder:

```sql
SELECT 
  fp.*,
  CASE 
    WHEN :permissionType = 'read' THEN fp.can_read
    WHEN :permissionType = 'create' THEN fp.can_create
    WHEN :permissionType = 'update' THEN fp.can_update
    WHEN :permissionType = 'delete' THEN fp.can_delete
    ELSE false
  END as has_permission
FROM folder_permissions fp
WHERE fp.folder_id = :folderId
  AND (fp.user_id = :userId OR fp.role_id = :roleId)
  AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
LIMIT 1;
```

## Get All Accessible Folder IDs

Get all folder IDs that a user can access:

```sql
SELECT DISTINCT fp.folder_id
FROM folder_permissions fp
WHERE fp.can_read = true
  AND (fp.user_id = :userId OR fp.role_id = :roleId)
  AND (fp.expires_at IS NULL OR fp.expires_at > NOW());
```

## Get Folder with Children Count

Get folder details with count of accessible children:

```sql
SELECT 
  f.*,
  COUNT(DISTINCT c.id) as children_count
FROM folders f
LEFT JOIN folders c ON c.parent_id = f.id 
  AND c.deleted_at IS NULL
  AND c.id IN (
    SELECT DISTINCT fp.folder_id
    FROM folder_permissions fp
    WHERE fp.can_read = true
      AND (fp.user_id = :userId OR fp.role_id = :roleId)
      AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
  )
WHERE f.id = :folderId
  AND f.deleted_at IS NULL
GROUP BY f.id;
```

## Get Files in Folder with Permissions

Get all files in a folder that the user can access:

```sql
SELECT 
  fl.*
FROM files fl
INNER JOIN folders f ON fl.folder_id = f.id
WHERE fl.folder_id = :folderId
  AND fl.deleted_at IS NULL
  AND f.deleted_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM folder_permissions fp
    WHERE fp.folder_id = f.id
      AND fp.can_read = true
      AND (fp.user_id = :userId OR fp.role_id = :roleId)
      AND (fp.expires_at IS NULL OR fp.expires_at > NOW())
  )
ORDER BY fl.created_at DESC;
```

## Notes

- All queries respect soft deletes (`deleted_at IS NULL`)
- Permission checks include expiration date validation
- Both user-specific and role-based permissions are checked
- The recursive CTE approach prevents infinite loops by tracking the path

