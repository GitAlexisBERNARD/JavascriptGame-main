// Obtenir des éléments de l'interface de jeu
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const attackRangeIndicator = document.getElementById('attack-range-indicator');


// Variables contrôler le jeu
let playerPosition = gameContainer.offsetWidth / 2; // Commence au milieu de l'écran
const playerSpeed = 5; // Vitesse du déplacement du joueur
const enemySpeed = 1; // Vitesse à laquelle les ennemis s'approchent
const attackRange = 400; // Distance à laquelle les ennemis attaquent le joueur
let isAttacking = false; // variable pour suivre si le joueur est en train d'attaquer   
let enemies = []; // Tableau pour stocker les ennemis
let lives = 6; // le joueur commence avec 3 vies
let isInvincible = false; // Indicateur d'invincibilité
let currentDirection = -1; // -1 pour droite, 1 pour gauche
let enemyCount = 0; // Compteur d'ennemis tués
let specialAttackActive = false; // Indique si le coup spécial est actif
let jaugeValue = 1; // Valeur actuelle de la jauge


document.addEventListener('keydown', function(event) {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    const newDirection = (event.key === "ArrowLeft") ? 1 : -1;

    // Vérifier si la direction a changé
    if (currentDirection !== newDirection) {
      // Appliquer l'animation de rotation
      player.className = newDirection === 1 ? 'player_switch_right_to_left' : 'player_switch_left_to_right';

      setTimeout(() => {
        triggerAttack(newDirection);
      }, 600); // Durée de l'animation de rotation (ajustez selon vos animations)
    } else {
      // Si la direction n'a pas changé, aller directement à l'attaque
      triggerAttack(newDirection);
    }

    currentDirection = newDirection;
  }
});

function triggerAttack(direction) {
  // Appliquer l'animation d'attaque
  player.className = direction === 1 ? 'player_left_attack' : 'player_right_attack';

  // Trouver et attaquer l'ennemi le plus proche
  findAndAttackClosestEnemy(direction);

  setTimeout(() => {
    // Revenir à l'état neutre après l'attaque
    player.className = direction === 1 ? 'player_left_neutral' : 'player_right_neutral';
  }, 600); // Durée de l'animation d'attaque (ajustez selon vos animations)
}

function findAndAttackClosestEnemy(direction) {
  let closestEnemy = null;
  let closestDistance = Number.MAX_VALUE;

  for (const enemy of enemies) {
    const distance = Math.abs(enemy.xPosition - playerPosition);

    if (enemy.direction === direction && distance < closestDistance && distance <= attackRange) {
      closestEnemy = enemy;
      closestDistance = distance;
    }
  }

  if (closestEnemy) {
    const teleportOffset = 100; // La distance avant l'ennemi où le joueur apparaîtra
    isAttacking = true;
    playerPosition = closestEnemy.xPosition + (direction * teleportOffset);
    player.style.left = `${playerPosition}px`;

    // Supprimer l'ennemi du DOM et du tableau
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
  jauge.style.backgroundImage = `url('../public/img/Jauge/jauge_${jaugeValue -1}.png')`; // Assurez-vous que les noms des fichiers sont corrects
}

let tt;

function activateSpecialAttack() {
  specialAttackActive = true;
  let pp = document.getElementById('game-container');
  pp.classList.add('redplayer'); 
  console.log('Special attack activated!');
  if (!tt) {
  tt = setTimeout(() => {
    specialAttackActive = false;
    pp.classList.remove('redplayer'); // Revenir à la classe normale après l'attaque spéciale
    jaugeValue = 0;// Réinitialiser le compteur d'ennemis tués
    updateSpecialAttackBar(); // Réinitialiser la jauge
  }, 10000); // Durée de l'attaque spéciale, ici 10 secondes
}
}

function spawnEnemy() {
  const enemy = document.createElement('div');
  enemy.classList.add('enemy');

  const isLeft = Math.random() < 0.5;
  enemy.style.left = isLeft ? '-30px' : `${gameContainer.offsetWidth}px`;
  enemy.style.top = `${player.offsetTop}px`;

  // Appliquer le sprite approprié en fonction de la direction
  if (isLeft) {
    enemy.style.backgroundImage = "url('../public/img/Enemy/Bat/enemy-left.png')";
  } else {
    enemy.style.backgroundImage = "url('../public/img/Enemy/Bat/enemy-right.png')";
  }

  gameContainer.appendChild(enemy);

  enemies.push({
    element: enemy,
    xPosition: parseInt(enemy.style.left, 10),
    direction: isLeft ? 1 : -1
  });
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
    <img src="../public/img/UI/heart.png" class="life" />
    <img src="../public/img/UI/heart.png" class="life" />
    <img src="../public/img/UI/heart.png" class="life" />
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
function gameOver() {
  alert('Game Over!');
  // votre logique de fin de jeu
  resetGame();
}

function gameLoop() {
  updateEnemies();
  
  // Générer des ennemis de façon aléatoire
  if (Math.random() < 0.02) { // Ajustez ce nombre pour changer la fréquence d'apparition des ennemis
    spawnEnemy();
  }
  requestAnimationFrame(gameLoop);
}

// Démarrer le jeu
gameLoop();