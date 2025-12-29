# VidéoDownloader Pro SaaS

Un SaaS professionnel pour télécharger des vidéos depuis n'importe quelle plateforme vidéo.

## 🚀 Fonctionnalités

- **Téléchargement depuis toutes les plateformes** : YouTube, Facebook, Instagram, TikTok, Vimeo, Twitter, etc.
- **Formats multiples** : MP4, MP3, AVI, MOV, et plus de 20 formats
- **Qualités variables** : De 480p à 4K UHD
- **API RESTful** complète
- **Interface moderne** et responsive
- **Sécurité** : Chiffrement SSL, pas de stockage des données

## 🛠️ Installation

### Prérequis
- Node.js (v14 ou supérieur)
- Windows/Linux/Mac

### Installation automatique
```bash
# Installer les dépendances
node install.js

# Installer yt-dlp (outil de téléchargement)
node install-ytdlp.js
```

### Démarrage du serveur
```bash
# Démarrage rapide (Windows)
start.bat

# Ou manuellement
node server.js
```

Le serveur sera accessible sur `http://localhost:3000`

## 📖 Utilisation

1. **Ouvrez votre navigateur** et allez sur `http://localhost:3000`
2. **Collez un lien vidéo** dans le champ prévu
3. **Cliquez sur "Analyser"** pour obtenir les informations de la vidéo
4. **Choisissez le format et la qualité** souhaités
5. **Cliquez sur "Télécharger"** pour lancer le téléchargement

## 🔧 API Endpoints

### Analyser une vidéo
```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=..."
}
```

### Télécharger une vidéo
```http
POST /api/download
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=...",
  "format": "mp4",
  "quality": "1080p"
}
```

## 📁 Structure du projet

```
├── video.html          # Interface utilisateur principale
├── server.js           # Serveur Express avec API
├── package.json        # Dépendances Node.js
├── yt-dlp.exe          # Outil de téléchargement (Windows)
├── downloads/          # Dossier des téléchargements temporaires
├── install.js          # Script d'installation des dépendances
├── install-ytdlp.js    # Script d'installation de yt-dlp
└── start.bat           # Script de démarrage (Windows)
```

## ⚠️ Avertissements

- **Utilisation responsable** : Respectez les droits d'auteur et les conditions d'utilisation des plateformes
- **Légalité** : Vérifiez la légalité du téléchargement dans votre juridiction
- **Limites** : Certaines vidéos peuvent être protégées contre le téléchargement

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez que yt-dlp.exe est bien présent dans le dossier
2. Assurez-vous que Node.js est installé
3. Consultez les logs du serveur pour les erreurs

## 📄 Licence

Ce projet est fourni à des fins éducatives. Utilisez-le de manière responsable.

---

**VidéoDownloader Pro** - Téléchargez des vidéos depuis n'importe quel lien ! 🎥