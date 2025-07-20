# 🏰 Sacred Battle Game - Four Champions

A mystical browser-based game featuring four unique champions defending against waves of enemies. Built with vanilla JavaScript and HTML5 Canvas, featuring advanced particle systems and animation effects.

## ✨ Features

### 🎮 Core Gameplay
- **Four Unique Champions**: Each with distinct abilities and visual designs
- **Enemy Waves**: Different enemy types requiring specific champions to defeat
- **Score System**: Points awarded for successful battles
- **Lives System**: Three lives with game over on depletion

### 🎨 Visual Effects
- **Advanced Particle System**: Victory sparkles, attack effects, and failure particles
- **State-Based Animations**: Characters respond to different states (idle, attack, hurt, victory)
- **Ambient Background**: Floating particles create atmospheric effects
- **Breathing Animations**: Subtle character movement for life-like feel
- **Blinking Eyes**: Frame-based blinking animations

### 🎯 Champions

| Champion | Key | Special Ability | Enemy Type |
|----------|-----|----------------|------------|
| **Oda** (Samurai) | `A` | Fear Magic | Goblin |
| **Xue** (Fox Woman) | `W` | Fire Magic | Bat |
| **Billy** (Dragon Halfling) | `S` | Dragon Claws | Skeleton |
| **Malakir** (Dragon Knight) | `D` | Sword Mastery | Troll |

### 🎪 Enemy Types

- **Goblin**: Brown, slow, needs Oda's fear magic
- **Bat**: Dark, fast, needs Xue's fire magic  
- **Skeleton**: White, medium speed, needs Billy's dragon claws
- **Troll**: Green, slow but tough, needs Malakir's sword mastery

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mpg-playground/sacred-battle-game
   ```

2. **Start a local server**:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   # or
   php -S localhost:8000
   ```

3. **Open your browser** and navigate to `http://localhost:8000`

4. **Play the game**:
   - Use keyboard keys `W`, `A`, `S`, `D` to activate champions
   - Or click the buttons below the game canvas
   - Match the correct champion to each enemy type
   - Watch for particle effects and animations!

## 🎮 Controls

### Keyboard Controls
- `W` - Activate Xue (Fox Woman)
- `A` - Activate Oda (Samurai)  
- `S` - Activate Billy (Dragon Halfling)
- `D` - Activate Malakir (Dragon Knight)

### Mouse Controls
- Click the champion buttons below the game canvas

## 🛠️ Technical Features

### Animation System
- **Frame-based animations** with configurable timing
- **State machine** for character behaviors
- **Particle physics** with velocity, gravity, and decay
- **Smooth transitions** between animation states

### Particle Effects
- **Victory sparkles**: Golden particles with glow effects
- **Attack particles**: Color-coded success/failure effects
- **Ambient particles**: Floating background elements
- **Physics simulation**: Gravity, velocity decay, life cycles

### Code Architecture
- **Modular design** with separate classes for different systems
- **SpriteSheet class** ready for image-based sprites
- **ParticleSystem class** for visual effects
- **State machine** for character animations

## 📁 File Structure

```
sacred-battle-game/
├── index.html          # Main game page
├── game.js            # Core game logic and systems
├── README.md          # This documentation
└── GAME_README.md     # Original game documentation
```

## 🎨 Customization

### Adding New Champions
1. Add character data to the `characters` array in `game.js`
2. Create a drawing function (e.g., `drawNewCharacter()`)
3. Add the case to the switch statement in `drawCharacter()`

### Adding New Enemies
1. Add enemy type to the `enemyTypes` array
2. Assign a champion to the enemy
3. The game will automatically spawn the new enemy type

### Modifying Particle Effects
- Edit the `ParticleSystem` class methods
- Adjust particle counts, colors, and physics
- Add new particle types for different effects

## 🔮 Future Enhancements

### Planned Features
- [ ] **Sound Effects**: Audio feedback for actions
- [ ] **Sprite Sheets**: Image-based character sprites
- [ ] **More Enemy Types**: Additional variety in enemies
- [ ] **Power-ups**: Special abilities and bonuses
- [ ] **Level System**: Progressive difficulty increases
- [ ] **Mobile Support**: Touch controls for mobile devices

### Technical Improvements
- [ ] **WebGL Rendering**: Hardware-accelerated graphics
- [ ] **Audio System**: Background music and sound effects
- [ ] **Save System**: Local storage for high scores
- [ ] **Multiplayer**: Real-time multiplayer battles

## 🎯 Game Mechanics

### Scoring System
- **Correct Champion**: +10-30 points (based on enemy type)
- **Wrong Champion**: -5 points
- **Enemy Escape**: -1 life

### Enemy Behavior
- Enemies spawn from the right side
- They move to 70% of screen width and wait
- Wrong champion attacks cause no damage
- Correct champion instantly defeats enemies

### Visual Feedback
- **Green particles**: Successful attacks
- **Red particles**: Failed attacks  
- **Golden sparkles**: Victory effects
- **Character glow**: State-based visual feedback

## 🐛 Troubleshooting

### Common Issues
1. **Game not loading**: Check that you're running a local server
2. **No particles**: Ensure JavaScript is enabled
3. **Slow performance**: Try reducing particle counts in the code
4. **Controls not working**: Check browser console for errors

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Mobile browsers**: Limited support (desktop recommended)

## 📝 Development Notes

This game was created as a learning project for:
- HTML5 Canvas animation
- JavaScript game development
- Particle system implementation
- State machine design
- Visual effects programming

The code is well-commented and modular, making it easy to extend and modify for learning purposes.

## 🤝 Contributing

Feel free to fork this project and add your own enhancements! Some ideas:
- New champion designs
- Additional particle effects
- Sound integration
- Mobile optimization
- Multiplayer features

## 📄 License

This project is open source and available under the MIT License.

---

*Created with mystical wisdom by Drust the Ancient Druid* 🧙‍♂️ 