# GameHub Dashboard 🎮

A modern gaming community platform where users can discover games, track their gaming library, connect with other gamers, and share their gaming experiences.

## 🚀 Features

### ✅ Current Features
- **Game Discovery** - Browse and search 500,000+ games via RAWG API
- **Personal Game Library** - Track games with status, ratings, and notes
- **User Profiles** - Unique usernames and customizable profiles
- **Social Features** - Follow other users and view their profiles
- **Game Reviews** - Rate and comment on games with community feedback
- **Favorites System** - Save favorite games for quick access
- **Real-time Search** - Live game suggestions with thumbnails
- **Activity Feed** - Track gaming activities across the platform
- **Authentication** - Email/password and Google OAuth login

### 🔄 In Development
- Dark/Light theme toggle
- Game wishlist functionality
- Enhanced profile customization
- Game categories and filtering

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication)
- **APIs**: RAWG Games API, Twitch API
- **State Management**: React Context
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- RAWG API key
- Twitch API credentials

## ⚡ Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd gamehub-dash
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env` file:
```env
VITE_RAPIDAPI_KEY=your_rawg_api_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_ADMIN_EMAIL=your_admin_email
```

4. **Firebase Configuration**
Update `src/lib/firebase.ts` with your Firebase config

5. **Start development server**
```bash
npm run dev
```

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Deploy security rules from `firestore.rules`
5. Create required indexes (see `FIRESTORE_SETUP.md`)

### API Keys
- **RAWG API**: Get free key at [rawg.io](https://rawg.io/apidocs)
- **Twitch API**: Register app at [dev.twitch.tv](https://dev.twitch.tv/console)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── game/          # Game-related components
│   └── ui/            # Base UI components
├── contexts/           # React contexts
├── lib/               # Utilities and configurations
├── pages/             # Route components
├── services/          # API and data services
├── types/             # TypeScript type definitions
└── utils/             # Helper functions
```

## 🎯 Roadmap

### 🟢 Basic Features (Next Sprint)
- [ ] Dark/Light theme toggle
- [ ] Game wishlist system
- [ ] Basic notifications
- [ ] Game categories/tags
- [ ] Recently viewed games
- [ ] Profile customization
- [ ] Game screenshots gallery
- [ ] Simple recommendations

### 🟡 Intermediate Features
- [ ] Friends system
- [ ] Rich game reviews
- [ ] Activity timeline
- [ ] Custom game lists
- [ ] Achievement system
- [ ] Game comparison tool
- [ ] Advanced search filters
- [ ] Gaming news integration
- [ ] Social sharing
- [ ] Price tracking

### 🔴 Advanced Features
- [ ] Real-time chat
- [ ] Streaming integration
- [ ] AI recommendations
- [ ] Game forums
- [ ] Live gaming sessions
- [ ] Analytics dashboard
- [ ] PWA functionality
- [ ] Gaming tournaments
- [ ] Marketplace integration
- [ ] Cross-platform sync

### ⚫ Expert Features
- [ ] Multiplayer matchmaking
- [ ] Game dev tools
- [ ] Creator tools
- [ ] Public API
- [ ] VR/AR support
- [ ] Blockchain integration
- [ ] AI chatbot
- [ ] Multi-language support
- [ ] Performance monitoring
- [ ] Custom game database

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: vedantvyas79@gmail.com
- 🐛 Issues: [GitHub Issues](../../issues)
- 📖 Docs: [Project Wiki](../../wiki)

## 🙏 Acknowledgments

- [RAWG](https://rawg.io/) for comprehensive game database
- [Twitch](https://dev.twitch.tv/) for game streaming data
- [Firebase](https://firebase.google.com/) for backend services
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

**Built with ❤️ for the gaming community**