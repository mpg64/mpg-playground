// Sacred Battle Game - Four Champions
// By Drust the Ancient Druid

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.gameRunning = true;
        
        // Character positions (true diamond formation on left side)
        this.characters = [
            { id: 1, x: 50, y: 300, width: 60, height: 80, color: '#8b4513', name: 'Oda', key: 'a', active: false }, // Center
            { id: 2, x: 150, y: 200, width: 60, height: 80, color: '#ff6b35', name: 'Xue', key: 'w', active: false },   // Top
            { id: 3, x: 250, y: 300, width: 60, height: 80, color: '#dc143c', name: 'Malakir', key: 'd', active: false },     // Right
            { id: 4, x: 150, y: 400, width: 60, height: 80, color: '#ffd700', name: 'Billy', key: 's', active: false }      // Bottom
        ];
        
        // Enemy types with their destined champions
        this.enemyTypes = [
            { name: 'Goblin', color: '#8b4513', speed: 2, health: 1, points: 10, width: 40, height: 50, champion: 'Oda' },
            { name: 'Bat', color: '#2c3e50', speed: 2.5, health: 1, points: 15, width: 35, height: 30, champion: 'Xue' },
            { name: 'Skeleton', color: '#f5f5dc', speed: 1.5, health: 2, points: 20, width: 45, height: 55, champion: 'Billy' },
            { name: 'Troll', color: '#228b22', speed: 1, health: 3, points: 30, width: 55, height: 65, champion: 'Malakir' }
        ];
        
        this.enemies = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 2000; // 2 seconds
        this.messages = [];
        this.messageDuration = 2000; // 2 seconds
        this.attackAnimations = [];
        
        // Animation states
        this.animationFrame = 0;
        this.animationSpeed = 0.1; // How fast animations cycle
        this.lastAnimationTime = 0;
        
        // Character animation states with enhanced state machine
        this.characters.forEach(char => {
            char.animationState = 'idle'; // idle, attack, hurt, victory
            char.animationFrame = 0;
            char.lastAnimationTime = 0;
            char.stateTimer = 0;
            char.stateDuration = 1000; // 1 second per state
            char.lastStateChange = 0;
        });
        
        // Particle system for enhanced visual effects
        this.particleSystem = new ParticleSystem();
        
        // Background particles for ambient effects
        this.backgroundParticles = [];
        this.initBackgroundParticles();
        
        // Example of how to use SpriteSheet for image-based sprites:
        // this.characterSprites = {
        //     'Oda': new SpriteSheet('sprites/samurai.png', 64, 64, 4),
        //     'Xue': new SpriteSheet('sprites/fox-woman.png', 64, 64, 4),
        //     'Billy': new SpriteSheet('sprites/dragon-halfling.png', 64, 64, 4),
        //     'Malakir': new SpriteSheet('sprites/dragon-knight.png', 64, 64, 4)
        // };
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initBackgroundParticles() {
        // Create ambient floating particles
        for (let i = 0; i < 20; i++) {
            this.backgroundParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                alpha: Math.random() * 0.3 + 0.1,
                color: ['#ffd700', '#ff6b35', '#800080'][Math.floor(Math.random() * 3)]
            });
        }
    }
    
    updateBackgroundParticles() {
        this.backgroundParticles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });
    }
    
    drawBackgroundParticles() {
        this.backgroundParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            this.ctx.restore();
        });
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.activateCharacter(key);
        });
        
        // Button controls
        document.getElementById('char1').addEventListener('click', () => this.activateCharacter('w'));
        document.getElementById('char2').addEventListener('click', () => this.activateCharacter('a'));
        document.getElementById('char3').addEventListener('click', () => this.activateCharacter('s'));
        document.getElementById('char4').addEventListener('click', () => this.activateCharacter('d'));
    }
    
    activateCharacter(key) {
        const character = this.characters.find(c => c.key === key);
        if (character) {
            character.active = true;
            character.animationState = 'attack';
            character.stateTimer = 0;
            character.lastStateChange = Date.now();
            
            // Create particle effect at character position
            this.particleSystem.createAttackEffect(character.x + character.width/2, character.y + character.height/2, true);
            
            // Check for enemy collisions
            this.checkCombat(character);
            
            // Reset active state after a short delay
            setTimeout(() => {
                character.active = false;
                character.animationState = 'idle';
            }, 200);
        }
    }
    
    checkCombat(character) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            // Check if this character is the destined champion for this enemy
            if (character.name === enemy.champion) {
                // Check if enemy is in range (anywhere on the right side)
                if (enemy.x > this.canvas.width * 0.3) {
                    // Instant defeat for correct champion
                    this.score += enemy.points;
                    this.enemies.splice(i, 1);
                    this.updateUI();
                    
                    // Show success message
                    this.showMessage(`${character.name} defeats ${enemy.name}!`, '#00ff00');
                    
                    // Add attack animation
                    this.addAttackAnimation(character, enemy, true);
                    
                    // Create victory particle effect
                    this.particleSystem.createVictoryEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                }
            } else {
                // Wrong champion - lose points and show message
                this.score = Math.max(0, this.score - 5);
                this.updateUI();
                this.showMessage(`Wrong champion! ${enemy.name} needs ${enemy.champion}!`, '#ff0000');
                
                // Add attack animation (failed)
                this.addAttackAnimation(character, enemy, false);
                
                // Create failure particle effect
                this.particleSystem.createFailureEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            }
        }
    }
    
    isColliding(char, enemy) {
        return char.x < enemy.x + enemy.width &&
               char.x + char.width > enemy.x &&
               char.y < enemy.y + enemy.height &&
               char.y + char.height > enemy.y;
    }
    
    spawnEnemy() {
        const now = Date.now();
        // Only spawn if no enemies are present
        if (this.enemies.length === 0 && now - this.lastSpawnTime > this.spawnInterval) {
            const enemyType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)];
            const yPositions = [200, 300, 400]; // Align with diamond formation
            const randomY = yPositions[Math.floor(Math.random() * yPositions.length)];
            
            const enemy = {
                x: this.canvas.width - 50,
                y: randomY,
                width: enemyType.width,
                height: enemyType.height,
                color: enemyType.color,
                name: enemyType.name,
                speed: enemyType.speed,
                health: enemyType.health,
                points: enemyType.points,
                champion: enemyType.champion, // Add the missing champion property
                targetX: this.canvas.width * 0.7, // Stop at 70% of screen width
                hasReachedPosition: false
            };
            
            this.enemies.push(enemy);
            this.lastSpawnTime = now;
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (!enemy.hasReachedPosition) {
                // Move toward target position
                if (enemy.x > enemy.targetX) {
                    enemy.x -= enemy.speed;
                } else {
                    enemy.x = enemy.targetX;
                    enemy.hasReachedPosition = true;
                }
            }
            
            // Remove enemies that have passed the left side (if they somehow get past)
            if (enemy.x + enemy.width < 0) {
                this.lives--;
                this.enemies.splice(i, 1);
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
    
    showMessage(text, color) {
        const message = {
            text: text,
            color: color,
            timestamp: Date.now(),
            y: 50 + this.messages.length * 30
        };
        this.messages.push(message);
        
        // Remove old messages
        setTimeout(() => {
            const index = this.messages.indexOf(message);
            if (index > -1) {
                this.messages.splice(index, 1);
            }
        }, this.messageDuration);
    }
    
    addAttackAnimation(character, enemy, isSuccessful) {
        const animation = {
            character: character,
            enemy: enemy,
            isSuccessful: isSuccessful,
            timestamp: Date.now(),
            duration: 500, // 0.5 seconds
            progress: 0
        };
        this.attackAnimations.push(animation);
        
        // Remove animation after duration
        setTimeout(() => {
            const index = this.attackAnimations.indexOf(animation);
            if (index > -1) {
                this.attackAnimations.splice(index, 1);
            }
        }, animation.duration);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Refresh to play again', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
    
    draw() {
        // Clear canvas with proper gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0f3460');
        gradient.addColorStop(1, '#533483');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background particles
        this.drawBackgroundParticles();
        
        // Draw characters with detailed sprites
        this.characters.forEach(char => {
            this.drawCharacter(char);
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Enemy name
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(enemy.name, enemy.x + enemy.width / 2, enemy.y - 5);
            
            // Show which champion is needed
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(`Needs: ${enemy.champion}`, enemy.x + enemy.width / 2, enemy.y + enemy.height + 15);
        });
        
        // Draw center line
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width * 0.7, 0);
        this.ctx.lineTo(this.canvas.width * 0.7, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw attack animations
        this.attackAnimations.forEach(animation => {
            this.drawAttackAnimation(animation);
        });
        
        // Draw messages
        this.messages.forEach(message => {
            const elapsed = Date.now() - message.timestamp;
            if (elapsed < this.messageDuration) {
                this.ctx.fillStyle = message.color;
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(message.text, this.canvas.width / 2, message.y);
            }
        });
    }
    
    drawCharacter(char) {
        const ctx = this.ctx;
        const x = char.x;
        const y = char.y;
        const width = char.width;
        const height = char.height;
        const isActive = char.active;
        const state = char.animationState;
        
        // Add pulsing effect for active characters
        const pulseScale = isActive ? 1.2 : 1.0;
        const pulseAlpha = isActive ? 0.8 : 1.0;
        
        // Add state-based effects
        let stateScale = 1.0;
        let stateAlpha = 1.0;
        let stateColor = null;
        
        switch(state) {
            case 'attack':
                stateScale = 1.1;
                stateAlpha = 0.9;
                stateColor = '#ffff00';
                break;
            case 'hurt':
                stateScale = 0.9;
                stateAlpha = 0.7;
                stateColor = '#ff0000';
                break;
            case 'victory':
                stateScale = 1.15;
                stateAlpha = 1.0;
                stateColor = '#00ff00';
                break;
        }
        
        ctx.save();
        ctx.globalAlpha = pulseAlpha * stateAlpha;
        ctx.translate(x + width/2, y + height/2);
        ctx.scale(pulseScale * stateScale, pulseScale * stateScale);
        ctx.translate(-(x + width/2), -(y + height/2));
        
        // Draw based on character type with animation
        switch(char.name) {
            case 'Oda':
                this.drawSamurai(x, y, width, height, isActive, char.animationFrame, stateColor);
                break;
            case 'Xue':
                this.drawFoxWoman(x, y, width, height, isActive, char.animationFrame, stateColor);
                break;
            case 'Billy':
                this.drawDragonHalfling(x, y, width, height, isActive, char.animationFrame, stateColor);
                break;
            case 'Malakir':
                this.drawDragonKnight(x, y, width, height, isActive, char.animationFrame, stateColor);
                break;
        }
        
        ctx.restore();
    }
    
    drawSamurai(x, y, width, height, isActive, frame, stateColor) {
        const ctx = this.ctx;
        
        // Breathing animation - subtle movement
        const breathOffset = Math.sin(frame * 0.5) * 2;
        
        // Body with state color effect
        if (stateColor) {
            ctx.fillStyle = stateColor;
            ctx.fillRect(x + 8, y + 18 + breathOffset, width - 16, height - 26);
        }
        ctx.fillStyle = isActive ? '#ff6b35' : '#8b4513';
        ctx.fillRect(x + 10, y + 20 + breathOffset, width - 20, height - 30);
        
        // Head with breathing
        ctx.fillStyle = '#f4a460';
        ctx.fillRect(x + 15, y + 5 + breathOffset, width - 30, 20);
        
        // Eyes that blink
        if (frame % 20 < 15) { // Blink every 20 frames
            ctx.fillStyle = '#000';
            ctx.fillRect(x + 20, y + 10 + breathOffset, 3, 3);
            ctx.fillRect(x + width - 23, y + 10 + breathOffset, 3, 3);
        }
        
        // Sword with attack animation
        if (isActive) {
            ctx.strokeStyle = stateColor || '#ffd700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + width/2, y + 15);
            ctx.lineTo(x + width + 20, y + 15);
            ctx.stroke();
        }
        
        // Add state-based glow effect
        if (stateColor) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = stateColor;
            ctx.fillRect(x + 5, y + 15 + breathOffset, width - 10, height - 20);
            ctx.restore();
        }
    }
    
    drawFoxWoman(x, y, width, height, isActive, frame, stateColor) {
        const ctx = this.ctx;
        
        // Dress body with better shape - BLACK
        ctx.fillStyle = isActive ? '#ffff00' : '#000000';
        ctx.fillRect(x + width * 0.15, y + height * 0.25, width * 0.7, height * 0.75);
        
        // Dress details
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(x + width * 0.2, y + height * 0.25, width * 0.6, height * 0.1);
        ctx.fillRect(x + width * 0.25, y + height * 0.5, width * 0.5, height * 0.1);
        
        // Head with better proportions
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(x + width * 0.25, y, width * 0.5, height * 0.25);
        
        // Fox ears with inner detail - WHITE FUR
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + width * 0.2, y - height * 0.12, width * 0.12, height * 0.18);
        ctx.fillRect(x + width * 0.68, y - height * 0.12, width * 0.12, height * 0.18);
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(x + width * 0.22, y - height * 0.08, width * 0.08, height * 0.12);
        ctx.fillRect(x + width * 0.7, y - height * 0.08, width * 0.08, height * 0.12);
        
        // Fox tail with fluffy detail - WHITE FUR
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + width * 0.05, y + height * 0.4, width * 0.25, height * 0.5);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x + width * 0.08, y + height * 0.45, width * 0.19, height * 0.4);
        
        // Fire magic orb with glow
        ctx.fillStyle = '#ff4500';
        ctx.beginPath();
        ctx.arc(x + width * 0.85, y + height * 0.4, width * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6347';
        ctx.beginPath();
        ctx.arc(x + width * 0.85, y + height * 0.4, width * 0.06, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawDragonHalfling(x, y, width, height, isActive, frame, stateColor) {
        const ctx = this.ctx;
        
        // Robe body with better shape - BROWN WAISTCOAT
        ctx.fillStyle = isActive ? '#ffff00' : '#8b4513';
        ctx.fillRect(x + width * 0.15, y + height * 0.25, width * 0.7, height * 0.75);
        
        // Robe details
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + width * 0.2, y + height * 0.25, width * 0.6, height * 0.1);
        ctx.fillRect(x + width * 0.25, y + height * 0.5, width * 0.5, height * 0.1);
        
        // Head with better proportions
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(x + width * 0.25, y, width * 0.5, height * 0.25);
        
        // Dragon horns with detail
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + width * 0.2, y - height * 0.08, width * 0.1, height * 0.15);
        ctx.fillRect(x + width * 0.7, y - height * 0.08, width * 0.1, height * 0.15);
        ctx.fillStyle = '#ffa500';
        ctx.fillRect(x + width * 0.22, y - height * 0.05, width * 0.06, height * 0.1);
        ctx.fillRect(x + width * 0.72, y - height * 0.05, width * 0.06, height * 0.1);
        
        // Dragon scales pattern
        ctx.fillStyle = '#654321';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(x + width * 0.25, y + height * 0.35 + i * 12, width * 0.5, 6);
        }
        
        // Dragon claws with detail
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + width * 0.8, y + height * 0.35, width * 0.12, height * 0.35);
        ctx.fillStyle = '#ffa500';
        ctx.fillRect(x + width * 0.82, y + height * 0.4, width * 0.08, height * 0.25);
        
        // Dragon eyes
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(x + width * 0.35, y + height * 0.08, width * 0.04, height * 0.06);
        ctx.fillRect(x + width * 0.61, y + height * 0.08, width * 0.04, height * 0.06);
    }
    
    drawDragonKnight(x, y, width, height, isActive, frame, stateColor) {
        const ctx = this.ctx;
        
        // Large armored body with better proportions - BRONZE ARMOR
        ctx.fillStyle = isActive ? '#ffff00' : '#cd7f32';
        ctx.fillRect(x + width * 0.1, y + height * 0.2, width * 0.8, height * 0.8);
        
        // Armor details
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + width * 0.15, y + height * 0.25, width * 0.7, height * 0.1);
        ctx.fillRect(x + width * 0.2, y + height * 0.5, width * 0.6, height * 0.1);
        ctx.fillRect(x + width * 0.25, y + height * 0.7, width * 0.5, height * 0.1);
        
        // Helmet with dragon crest
        ctx.fillStyle = '#cd7f32';
        ctx.fillRect(x + width * 0.15, y, width * 0.7, height * 0.3);
        
        // Dragon crest on helmet
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + width * 0.3, y - height * 0.08, width * 0.4, height * 0.15);
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + width * 0.35, y - height * 0.05, width * 0.3, height * 0.08);
        
        // Large sword with detail
        ctx.fillStyle = '#silver';
        ctx.fillRect(x + width * 0.8, y + height * 0.15, width * 0.15, height * 0.7);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + width * 0.75, y + height * 0.35, width * 0.05, height * 0.2);
        
        // Sword guard
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + width * 0.73, y + height * 0.3, width * 0.09, height * 0.1);
        
        // Armor shoulder plates
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(x + width * 0.12, y + height * 0.25, width * 0.1, height * 0.15);
        ctx.fillRect(x + width * 0.78, y + height * 0.25, width * 0.1, height * 0.15);
    }
    
    drawAttackAnimation(animation) {
        const elapsed = Date.now() - animation.timestamp;
        const progress = Math.min(elapsed / animation.duration, 1);
        
        const char = animation.character;
        const enemy = animation.enemy;
        
        // Calculate animation position
        const startX = char.x + char.width;
        const endX = enemy.x;
        const currentX = startX + (endX - startX) * progress;
        
        // Draw attack effect based on character type
        switch(char.name) {
            case 'Oda':
                this.drawSamuraiAttack(currentX, char.y + char.height * 0.4, progress, animation.isSuccessful);
                break;
            case 'Xue':
                this.drawFoxWomanAttack(currentX, char.y + char.height * 0.4, progress, animation.isSuccessful);
                break;
            case 'Billy':
                this.drawDragonHalflingAttack(currentX, char.y + char.height * 0.4, progress, animation.isSuccessful);
                break;
            case 'Malakir':
                this.drawDragonKnightAttack(currentX, char.y + char.height * 0.4, progress, animation.isSuccessful);
                break;
        }
    }
    
    drawSamuraiAttack(x, y, progress, isSuccessful) {
        // Purple fear magic effect
        this.ctx.fillStyle = isSuccessful ? '#800080' : '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fear aura
        if (isSuccessful && progress > 0.3) {
            this.ctx.fillStyle = '#800080';
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawFoxWomanAttack(x, y, progress, isSuccessful) {
        // Fireball
        this.ctx.fillStyle = isSuccessful ? '#ff4500' : '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fire trail
        if (progress > 0.2) {
            this.ctx.fillStyle = isSuccessful ? '#ff4500' : '#ff0000';
            this.ctx.globalAlpha = 0.7;
            this.ctx.beginPath();
            this.ctx.arc(x - 15, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
        
        // Fire particles
        if (isSuccessful && progress > 0.5) {
            this.ctx.fillStyle = '#ff6347';
            this.ctx.beginPath();
            this.ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x - 5, y + 5, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawDragonHalflingAttack(x, y, progress, isSuccessful) {
        // Claw slash effect
        this.ctx.strokeStyle = isSuccessful ? '#ffd700' : '#ff0000';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 15, y - 8);
        this.ctx.lineTo(x + 15, y + 8);
        this.ctx.stroke();
        
        // Second claw
        this.ctx.beginPath();
        this.ctx.moveTo(x - 10, y + 5);
        this.ctx.lineTo(x + 10, y - 5);
        this.ctx.stroke();
        
        // Dragon energy
        if (isSuccessful && progress > 0.4) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.globalAlpha = 0.8;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawDragonKnightAttack(x, y, progress, isSuccessful) {
        // Large sword slash
        this.ctx.strokeStyle = isSuccessful ? '#ffff00' : '#ff0000';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 25, y - 12);
        this.ctx.lineTo(x + 25, y + 12);
        this.ctx.stroke();
        
        // Sword energy
        if (isSuccessful && progress > 0.3) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillRect(x - 20, y - 15, 40, 30);
            this.ctx.globalAlpha = 1;
        }
        
        // Impact sparkles
        if (isSuccessful && progress > 0.6) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(x + 10, y - 8, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x - 10, y + 8, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    updateAnimations(currentTime) {
        // Update global animation frame
        if (currentTime - this.lastAnimationTime > 100) {
            this.animationFrame = (this.animationFrame + 1) % 4; // 4-frame cycle
            this.lastAnimationTime = currentTime;
        }
        
        // Update character animations with enhanced state machine
        this.characters.forEach(char => {
            // Update state timer
            char.stateTimer = currentTime - char.lastStateChange;
            
            if (char.active) {
                char.animationState = 'attack';
                char.animationFrame = 0;
                char.lastAnimationTime = currentTime;
                char.lastStateChange = currentTime;
            } else if (char.stateTimer > char.stateDuration) {
                // State transition logic
                if (char.animationState === 'attack') {
                    char.animationState = 'idle';
                    char.lastStateChange = currentTime;
                } else if (char.animationState === 'hurt') {
                    char.animationState = 'idle';
                    char.lastStateChange = currentTime;
                } else if (char.animationState === 'victory') {
                    char.animationState = 'idle';
                    char.lastStateChange = currentTime;
                }
            }
            
            // Update animation frame for idle state
            if (char.animationState === 'idle' && currentTime - char.lastAnimationTime > 200) {
                char.animationFrame = (char.animationFrame + 1) % 4;
                char.lastAnimationTime = currentTime;
            }
        });
        
        // Update background particles
        this.updateBackgroundParticles();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        
        // Update animations
        this.updateAnimations(currentTime);
        
        // Update particle effects
        this.particleSystem.update();
        
        this.spawnEnemy();
        this.updateEnemies();
        this.draw();
        
        // Draw particles on top of everything
        this.particleSystem.draw(this.ctx);
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Create a sprite sheet loader
class SpriteSheet {
    constructor(imagePath, frameWidth, frameHeight, frameCount) {
        this.image = new Image();
        this.image.src = imagePath;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.currentFrame = 0;
        this.frameDelay = 100; // milliseconds between frames
        this.lastFrameTime = 0;
    }
    
    update(currentTime) {
        if (currentTime - this.lastFrameTime > this.frameDelay) {
            this.currentFrame = (this.currentFrame + 1) % this.frameCount;
            this.lastFrameTime = currentTime;
        }
    }
    
    draw(ctx, x, y) {
        const sourceX = this.currentFrame * this.frameWidth;
        ctx.drawImage(
            this.image,
            sourceX, 0, this.frameWidth, this.frameHeight,
            x, y, this.frameWidth, this.frameHeight
        );
    }
}

// Enhanced particle system for visual effects
class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    createAttackEffect(x, y, isSuccessful) {
        const color = isSuccessful ? '#00ff00' : '#ff0000';
        const count = isSuccessful ? 8 : 4;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: color,
                size: Math.random() * 3 + 1,
                type: 'attack'
            });
        }
    }
    
    createVictoryEffect(x, y) {
        // Golden sparkles for victory
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 45,
                maxLife: 45,
                color: '#ffd700',
                size: Math.random() * 4 + 2,
                type: 'victory'
            });
        }
        
        // Add some green particles for extra effect
        for (let i = 0; i < 6; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 40,
                maxLife: 40,
                color: '#00ff00',
                size: Math.random() * 3 + 1,
                type: 'victory'
            });
        }
    }
    
    createFailureEffect(x, y) {
        // Red particles for failure
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 25,
                maxLife: 25,
                color: '#ff0000',
                size: Math.random() * 2 + 1,
                type: 'failure'
            });
        }
        
        // Add some dark particles
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30,
                maxLife: 30,
                color: '#800000',
                size: Math.random() * 2 + 1,
                type: 'failure'
            });
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Add gravity effect for some particles
            if (particle.type === 'victory') {
                particle.vy += 0.2; // Slight gravity for victory particles
            }
            
            // Slow down particles over time
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Decrease life
            particle.life--;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // Different drawing styles based on particle type
            if (particle.type === 'victory') {
                // Sparkle effect for victory particles
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Add glow effect
                ctx.globalAlpha = alpha * 0.5;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Regular particles
                ctx.fillStyle = particle.color;
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            }
            
            ctx.restore();
        });
    }
}

// Initialize the sacred battle when the page loads
window.addEventListener('load', () => {
    new Game();
}); 