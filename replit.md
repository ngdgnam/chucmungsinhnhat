# Zalo Bot Integrated

## Overview
Zalo Bot tich hop tu hai du an:
- **Zeid_Bot** (Shinchan0911): He thong commands/events, QR login, database
- **GwenDev_ZaloChat** (gwendevz): Auto/Anti handlers, web dashboard

## Tinh nang chinh
- Dang nhap bang QR code (uu tien) hoac Cookie
- He thong command handler voi prefix tuy chinh va phan quyen (user/support/admin)
- He thong event handler lang nghe tin nhan va cac su kien Zalo
- Anti handlers: AntiSpam va AntiLink de quan ly nhom
- Auto handlers: AutoDown (download tu nhieu nen tang)
- Database system cho Users va Threads voi JSON storage
- Web dashboard hien thi trang thai bot va thong ke

## Cau truc du an
```
├── index.js          # Entry point
├── bot.js            # Main bot logic
├── config.yml        # Cau hinh bot
├── core/
│   ├── login.js      # Dang nhap Zalo
│   ├── listen.js     # Lang nghe su kien
│   ├── handle/       # Xu ly command va event
│   ├── loader/       # Tai commands va events
│   ├── controller/   # Database controllers
│   ├── anti/         # Anti handlers
│   └── auto/         # Auto handlers
├── plugins/
│   ├── commands/     # Cac lenh bot
│   └── events/       # Cac su kien
├── dashboard/        # Web dashboard
│   ├── server.js
│   └── views/
└── utils/            # Cac tien ich
```

## Huong dan su dung
1. Chay bot: `npm start`
2. Quet ma QR bang Zalo de dang nhap
3. Su dung prefix mac dinh `/` de goi lenh
4. Truy cap dashboard tai http://localhost:5000

## Commands co san
- `/menu` - Hien thi danh sach lenh
- `/id` - Lay ID cua ban hoac nhom
- `/uptime` - Xem thoi gian bot hoat dong
- `/ping` - Kiem tra do tre cua bot
- `/anti <spam|link> <on|off>` - Bat/tat tinh nang anti
- `/setprefix <prefix>` - Thay doi prefix cho nhom

## User Preferences
- Ngon ngu: Tieng Viet
- Prefix mac dinh: /

## Recent Changes
- 2025-12-12: Hoan thanh tich hop du an - QR login, command/event system, Anti/Auto handlers, web dashboard
- 2024: Khoi tao du an tich hop tu Zeid_Bot va GwenDev_ZaloChat
