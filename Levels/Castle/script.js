// Obtenir des éléments de l'interface de jeu
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const attackRangeIndicator = document.getElementById('attack-range-indicator');
const screenWidth = window.innerWidth;

// Variables contrôler le jeu
let playerPosition = gameContainer.offsetWidth / 2; // Commence au milieu de l'écran
const playerSpeed = 5; // Vitesse du déplacement du joueur
const enemySpeed = 1; // Vitesse à laquelle les ennemis s'approchent
let attackRange = 320; // Distance à laquelle les ennemis attaquent le joueur
let isAttacking = false; // variable pour suivre si le joueur est en train d'attaquer
let enemies = []; // Tableau pour stocker les ennemis
let lives = 3; // le joueur commence avec 3 vies
let isInvincible = false; // Indicateur d'invincibilité
let currentDirection = -1; // -1 pour droite, 1 pour gauche
let enemyCount = 0; // Compteur d'ennemis tués
let specialAttackActive = false; // Indique si le coup spécial est actif
let jaugeValue = 1; // Valeur actuelle de la jauge
let gameStarted = false;
const level = [
  { type: 'bat', time: 1000, direction: 'left' },
  { type: 'ghost', time: 3000, direction: 'right' },
  { type: 'samurai', time: 5000, direction: 'left' },
];

document.addEventListener('keydown', function(event) {
  if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !isAttacking) {
    isAttacking = true; // Empêcher de nouvelles attaques
    const newDirection = (event.key === "ArrowLeft") ? 1 : -1;

    if (currentDirection !== newDirection) {
      player.className = newDirection === 1 ? 'player_switch_right_to_left' : 'player_switch_left_to_right';
      setTimeout(() => {
        triggerAttack(newDirection);
      }, 600); // Durée de l'animation de rotation
    } else {
      triggerAttack(newDirection);
    }

    currentDirection = newDirection;
  }
});

function triggerAttack(direction) {
  player.className = direction === 1 ? 'player_left_attack' : 'player_right_attack';

  findAndAttackClosestEnemy(direction);

  setTimeout(() => {
    player.className = direction === 1 ? 'player_left_neutral' : 'player_right_neutral';
    isAttacking = false; // Autoriser de nouvelles attaques
  }, 600); // Assurez-vous que cette durée correspond à la durée de l'animation d'attaque
}

function findAndAttackClosestEnemy(direction) {
  let closestEnemy = null;
  let closestDistance = Number.MAX_VALUE;

    for (const enemy of enemies) {
        const distance = Math.abs(enemy.xPosition - playerPosition);

        // Réduire la portée de l'attaque sur la gauche
        let isInRange = false;
        if (direction === -1) { // Attaque vers la gauche
            isInRange = distance <= (attackRange - 100) && enemy.direction === direction;
        } else { // Attaque vers la droite
            isInRange = distance <= attackRange && enemy.direction === direction;
        }

        if (isInRange && distance < closestDistance) {
            closestEnemy = enemy;
            closestDistance = distance;
        }
    }

  if (closestEnemy) {
    const teleportOffset = 100; // La distance avant l'ennemi où le joueur apparaîtra
    isAttacking = true;
    playerPosition = closestEnemy.xPosition + (direction * teleportOffset);
    player.style.left = `${playerPosition}px`;

    if (closestEnemy.type === 'samurai' && closestEnemy.health > 1) {
      closestEnemy.health--;
      closestEnemy.isWeakened = true;
      // Changez le sprite pour afficher l'état affaibli
      closestEnemy.element.style.backgroundImage = `url('../../Enemy/samurai/enemy-${closestEnemy.direction === 1 ? 'left' : 'right'}-weakened.png')`;
      setTimeout(() => {
        isAttacking = false;
      }, 100); // Durée pour terminer l'état d'attaque
      return; // Ne pas supprimer l'ennemi et ne pas augmenter le compteur
    }

    closestEnemy.element.remove();
    enemyCount++;
    document.getElementById('enemy-count').textContent = enemyCount; // Mettre à jour l'élément dans le HTML

    console.log(jaugeValue);
    if (!specialAttackActive) {
      jaugeValue++;
    }
    if (jaugeValue == 17) {
      activateSpecialAttack();
      // Réinitialiser le compteur d'ennemis tués
      // Réinitialiser la jauge
    }
    updateSpecialAttackBar();
    enemies.splice(enemies.indexOf(closestEnemy), 1);

    setTimeout(() => {
      isAttacking = false;
    }, 100); // Durée pour terminer l'état d'attaque
  }
}

function updateSpecialAttackBar() {
  const jauge = document.getElementById('jauge'); // Assurez-vous d'avoir cet élément dans votre HTML
  jauge.style.backgroundImage = `url('../../Jauge/jauge_${jaugeValue -1}.png')`; // Assurez-vous que les noms des fichiers sont corrects
}

let tt;

function activateSpecialAttack() {
  specialAttackActive = true;
  let pp = document.getElementById('game-container');
  pp.classList.add('redplayer');
const attackRangeBar = document.getElementById('attack-range-bar');
    attackRangeBar.classList.add('special-attack-range');
  console.log('Special attack activated!');
  attackRange = 400;
  if (!tt) {
  tt = setTimeout(() => {
    specialAttackActive = false;
    attackRange = 320;
    attackRangeBar.classList.remove('special-attack-range');
    pp.classList.remove('redplayer'); // Revenir à la classe normale après l'attaque spéciale
    jaugeValue = 0;// Réinitialiser le compteur d'ennemis tués
    updateSpecialAttackBar(); // Réinitialiser la jauge
  }, 10000); // Durée de l'attaque spéciale, ici 10 secondes
}
}

function spawnEnemy(type, direction) {
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');

  const isLeft = direction === 'left';
  enemy.style.left = isLeft ? '-30px' : `${gameContainer.offsetWidth}px`;
  enemy.style.top = `${player.offsetTop}px`;

  // Choisir l'image de fond en fonction du type et de la direction de l'ennemi
  enemy.style.backgroundImage = `url('../../Enemy/${type}/enemy-${direction}.png')`;

  // Si l'ennemi est un type spécifique, ajuster sa position verticale
  

  if (type === 'bat') {
    if (screenWidth < 768) { // Exemple de condition pour un écran plus petit
      enemy.style.top = '330px'; // Position ajustée pour les petits écrans
    } else {
      enemy.style.top = '530px'; // Position pour les écrans plus grands
    }
  }
  if (type === 'samurai') {
    enemy.style.top = '600px';
  }

  gameContainer.appendChild(enemy);

  const enemyObject = {
    element: enemy,
    xPosition: parseInt(enemy.style.left, 10),
    direction: isLeft ? 1 : -1,
    type: type,
    health: type === 'samurai' ? 2 : 1, // Les samurais ont 2 points de vie
    isWeakened: false
  };

  enemies.push(enemyObject);
}

function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    // Déplacer l'ennemi vers le joueur
    enemy.xPosition += enemy.direction * enemySpeed;

    // Si le joueur est en train d'attaquer, on saute la vérification de collision
    if (!isAttacking) {
      // Vérifier si l'ennemi a atteint la position du joueur pour déclencher game over
if ((enemy.direction === 1 && enemy.xPosition >= playerPosition && enemy.xPosition < playerPosition + player.offsetWidth) ||
    (enemy.direction === -1 && enemy.xPosition <= playerPosition + player.offsetWidth && enemy.xPosition > playerPosition)) {
  removeLife(); // le joueur perd une vie au lieu de game over
  return; // sortir de la fonction si vous voulez arrêter de vérifier les autres ennemis après avoir perdu une vie
}
    }

    // Mettre à jour la position de l'ennemi sur l'écran
    enemy.element.style.left = `${enemy.xPosition}px`;
  }
}

function resetGame() {
  // Réinitialiser les vies visuellement
  const livesContainer = document.getElementById('lives-container');
  livesContainer.innerHTML = `
    <img src="../../UI/heart.png" class="life" />
    <img src="../../UI/heart.png" class="life" />
    <img src="../../UI/heart.png" class="life" />
  `;
  lives = 3;
  // autre logique de réinitialisation du jeu
}

function removeLife() {
  if (!isInvincible) {
    lives--; // décrémenter le nombre de vies
    const livesContainer = document.getElementById('lives-container');
    if (livesContainer.children.length > 0) {
      livesContainer.removeChild(livesContainer.children[0]); // enlever une icône de vie du DOM
    }

    if (lives <= 0) {
      gameOver(); // fin du jeu si le joueur n'a plus de vies
    } else {
      // Début de la période d'invincibilité
      isInvincible = true;
      setTimeout(() => {
        isInvincible = false; // Le joueur peut à nouveau perdre des vies après 3 secondes, par exemple
      }, 3000);
    }
  }
}
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');

leftButton.addEventListener('touchstart', () => triggerArrowKey('ArrowLeft'));
rightButton.addEventListener('touchstart', () => triggerArrowKey('ArrowRight'));

function triggerArrowKey(key) {
    if (!isAttacking) {
        isAttacking = true; // Empêcher de nouvelles attaques
        const newDirection = (key === "ArrowLeft") ? 1 : -1;

        if (currentDirection !== newDirection) {
            player.className = newDirection === 1 ? 'player_switch_right_to_left' : 'player_switch_left_to_right';
            setTimeout(() => {
                triggerAttack(newDirection);
            }, 600); // Durée de l'animation de rotation
        } else {
            triggerAttack(newDirection);
        }

        currentDirection = newDirection;
    }
}

function updateAttackRangeBar() {
    const attackRangeBar = document.getElementById('attack-range-bar');
    if (attackRangeBar) {
        const leftOffset = 125;
        const newPosition = player.offsetLeft + player.offsetWidth / 2 - attackRangeBar.offsetWidth / 2 - leftOffset;
        attackRangeBar.style.left = `${newPosition}px`;
    }
}

function gameOver() {
  window.location.href = 'dead.html';
}

function gameLoop() {
  updateEnemies();



  if (gameStarted && enemies.length === 0) {
    window.location.href = 'end.html';
  }
 updateAttackRangeBar();
  requestAnimationFrame(gameLoop);
}

// Fonction pour initialiser les ennemis du niveau
function startLevel() {
  level.forEach(enemy => {
    setTimeout(() => {
      spawnEnemy(enemy.type, enemy.direction);
      gameStarted = true; // Indiquer que le jeu a commencé
    }, enemy.time);
  });
}

// Démarrer le jeu avec le spawn initial des ennemis
startLevel();

// Démarrer la boucle de jeu
gameLoop();
