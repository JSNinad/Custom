# Radhika & Satheesha — Wedding Invitation

Premium mobile-first digital wedding invitation (static site).

## Wedding

- **Bride:** Chi. Sou. Radhika  
- **Groom:** Chi. Satheesha D.  
- **Date:** Sunday, 15th November 2026  
- **Muhurtham:** 9:25 AM — 10:15 AM  
- **Venue:** Sri Sadashiva Temple, Kiriyadi, Ujire  

No RSVP form is included.

## Quick start

Open `index.html` in a browser, or serve the folder locally:

```bash
# Python
python -m http.server 8080

# Then visit http://localhost:8080
```

## Project structure

```text
wedding-invitation/
├── index.html
├── css/style.css
├── js/main.js
├── js/particles.js
├── js/scratch.js
├── assets/
│   ├── images/          # illustrations + gallery placeholders
│   └── music/wedding.mp3   # optional — add your track
└── reference/
    ├── reel.mp4
    ├── invitation-card.jpg
    └── frames/          # extracted stills from the reel
```

## Replace later

| File | Purpose |
|------|---------|
| `assets/images/photo-01.jpg` … `photo-04.jpg` | Real couple photos |
| `assets/music/wedding.mp3` | Background music |
| `assets/images/cover-illustration.jpg` | Opening cover art |
| `assets/images/temple-garden.jpg` | Hero / venue art |

If `wedding.mp3` is missing, the site still works; the music button simply will not play audio.

## Features

- Touch-to-open cover with cinematic name reveal  
- Falling petal / flower canvas system  
- Save-the-date countdown (local time → 15 Nov 2026, 9:25)  
- Ceremony + venue sections  
- Scratch-to-reveal (“You Are Invited”)  
- Floating music control (starts after open)  
- Scroll animations (GSAP + ScrollTrigger when available)  
- `prefers-reduced-motion` support  
- Mobile-first; desktop centers the invitation column  

## Deploy

Upload the entire `wedding-invitation` folder to any static host (Netlify, Vercel, GitHub Pages, S3, etc.). No backend required.
