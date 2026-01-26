# Fix Dependency Installation

## Problem
Error saat `npm install` karena konflik peer dependency antara `@nestjs/config` dan `@nestjs/common@11`.

## Solution

Gunakan `--legacy-peer-deps` untuk menginstall dependencies:

```bash
npm install --legacy-peer-deps
```

## Alternative: Update semua package

Jika ingin versi yang lebih kompatibel, update package.json dengan versi terbaru:

```bash
npm install @nestjs/config@latest @nestjs/jwt@latest @nestjs/passport@latest --legacy-peer-deps
```

## Kenapa --legacy-peer-deps?

Flag ini menginstruksikan npm untuk mengabaikan peer dependency conflicts. Meskipun ada warning, aplikasi biasanya tetap berjalan dengan baik karena:

1. NestJS 11 masih backward compatible dengan banyak package NestJS 10
2. @nestjs/config 3.x biasanya masih bekerja dengan NestJS 11
3. Peer dependency adalah warning, bukan hard requirement

## Setelah Install

Setelah berhasil install, jalankan aplikasi:

```bash
npm run start:dev
```

Jika ada error runtime terkait @nestjs/config, baru kita perlu update ke versi yang lebih spesifik.

