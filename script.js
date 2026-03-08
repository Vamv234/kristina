(function() {
    // Данные
    const reasons = [
        { emoji: '💖', title: 'Твоя любовь', text: 'рядом с тобой я чувствую себя по-настоящему счастливым каждый день' },
        { emoji: '✨', title: 'Твоя нежность', text: 'твои объятия и голос успокаивают и делают любой день лучше' },
        { emoji: '😊', title: 'Твоя улыбка', text: 'когда ты улыбаешься, у меня сразу становится тепло на душе' },
        { emoji: '🌷', title: 'Твоя красота', text: 'ты невероятно красивая и внешне, и внутри' },
        { emoji: '🫶', title: 'Твоя забота', text: 'ты умеешь поддержать в нужный момент, и это бесценно' },
        { emoji: '🔥', title: 'Твой характер', text: 'в тебе есть сила, уверенность и та самая искренность, которую я так ценю' },
        { emoji: '💌', title: 'Просто ты', text: 'ты моя любимая девочка, и я благодарен судьбе за тебя' }
    ];

    const flowerEmojis = ['🌷', '🌹', '🌸', '🌼', '🌷', '🌹', '🌸', '🌼'];
    const secretPhotos = [
        'assets/secret/0E66A19E-C168-4ADA-B097-B10AD94246E1.jpeg',
        'assets/secret/26B422F3-C48B-4CD1-9526-F35388420210.jpeg',
        'assets/secret/4CF2506C-0286-49BF-9C16-41E0BF8BC895.jpeg',
        'assets/secret/7AEF2DAA-515F-4126-B9D1-A6463CE3F8F3.jpeg',
        'assets/secret/9DCE7B9E-DD46-4C5E-B2FE-D88339D7C4D5.jpeg',
        'assets/secret/C6FA8756-8E7E-4DE8-B8D7-B2DCD60658E8.jpeg',
        'assets/secret/CA0A5850-0202-4EA5-852E-5A4548D6A827.jpeg',
        'assets/secret/D58093CD-EA24-4860-8E0C-CD3233EE7759.jpeg'
    ];
    
    // Состояние
    let openedReasons = new Array(7).fill(false);
    let cards = [];
    let flippedIndices = [];
    let locked = false;
    let matchedCount = 0;
    let secretUnlocked = false;
    
    // DOM элементы
    const accordion = document.getElementById('accordion');
    const nextToGameBtn = document.getElementById('nextToGame');
    const nextToGalleryBtn = document.getElementById('nextToGallery');
    const nextToSecretBtn = document.getElementById('nextToSecret');
    const gridEl = document.getElementById('game-grid');
    const pairsSpan = document.getElementById('pairs-found');
    const winMsg = document.getElementById('win-message');
    const dots = document.querySelectorAll('.dot');
    const navDots = document.getElementById('navDots');
    const startBtn = document.getElementById('startJourney');
    const openSecretBtn = document.getElementById('openSecret');
    const backToPasswordBtn = document.getElementById('backToPassword');
    const secretInput = document.getElementById('secretPassword');
    const secretError = document.getElementById('secretError');
    const secretGallery = document.getElementById('secretGallery');
    const secretGrid = document.getElementById('secretGrid');
    
    const pages = {
        0: document.getElementById('page0'),
        1: document.getElementById('page1'),
        2: document.getElementById('page2'),
        3: document.getElementById('page3'),
        4: document.getElementById('page4'),
        5: document.getElementById('page5')
    };

    // Рендер аккордеона
    function renderAccordion() {
        accordion.innerHTML = reasons.map((reason, idx) => `
            <div class="accordion-item" data-index="${idx}">
                <div class="accordion-header">
                    <span><span class="emoji-bullet">${reason.emoji}</span> ${reason.title}</span>
                    <span class="arrow">→</span>
                </div>
                <div class="accordion-content">
                    <p>${reason.text}</p>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.accordion-item').forEach(item => {
            const header = item.querySelector('.accordion-header');
            const index = parseInt(item.dataset.index);
            
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                
                document.querySelectorAll('.accordion-item').forEach(oi => {
                    if (oi !== item) oi.classList.remove('open');
                });
                
                item.classList.toggle('open');
                
                if (!openedReasons[index]) {
                    openedReasons[index] = true;
                    checkAllReasonsOpened();
                }
            });
        });
    }

    // Проверка всех причин
    function checkAllReasonsOpened() {
        const allOpened = openedReasons.every(opened => opened === true);
        if (allOpened) {
            nextToGameBtn.style.display = 'flex';
            nextToGameBtn.classList.add('animate-slide-up');
        }
    }

    // Инициализация игры
    function initGame() {
        let shuffled = shuffle([...flowerEmojis]);
        cards = shuffled.map((emoji, index) => ({
            emoji,
            id: index,
            matched: false,
            flipped: false
        }));
        flippedIndices = [];
        matchedCount = 0;
        pairsSpan.textContent = '0';
        winMsg.innerHTML = '';
        nextToGalleryBtn.style.display = 'none';
        renderBoard();
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function renderBoard() {
        gridEl.innerHTML = cards.map((card, idx) => {
            let classes = 'card';
            if (card.flipped) classes += ' flipped';
            if (card.matched) classes += ' matched';
            return `<div class="${classes}" data-index="${idx}"><span class="card-emoji">${card.emoji}</span></div>`;
        }).join('');

        gridEl.querySelectorAll('.card').forEach(cardDiv => {
            cardDiv.addEventListener('click', (e) => {
                const index = cardDiv.dataset.index;
                if (locked || !index) return;
                handleCardClick(parseInt(index));
            });
        });
    }

    function handleCardClick(index) {
        const card = cards[index];
        if (card.matched || card.flipped) return;
        if (flippedIndices.length === 2) return;

        card.flipped = true;
        flippedIndices.push(index);
        renderBoard();

        if (flippedIndices.length === 2) {
            checkMatch();
        }
    }

    function checkMatch() {
        locked = true;
        const [i1, i2] = flippedIndices;
        const card1 = cards[i1];
        const card2 = cards[i2];

        if (card1.emoji === card2.emoji) {
            // Совпадение
            card1.matched = true;
            card2.matched = true;
            matchedCount++;
            pairsSpan.textContent = matchedCount;

            flippedIndices = [];
            locked = false;
            renderBoard();

            if (matchedCount === 4) {
                winMsg.innerHTML = '🎉 Поздравляю! Все пары собраны! 💐';
                nextToGalleryBtn.style.display = 'flex';
                nextToGalleryBtn.classList.add('animate-slide-up');
            }
        } else {
            // Не совпали - добавляем анимацию mismatch
            const cardElements = document.querySelectorAll('.card');
            cardElements[i1].classList.add('mismatch');
            cardElements[i2].classList.add('mismatch');
            
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                flippedIndices = [];
                locked = false;
                
                // Убираем класс mismatch
                cardElements[i1].classList.remove('mismatch');
                cardElements[i2].classList.remove('mismatch');
                
                renderBoard();
            }, 500);
        }
        renderBoard();
    }

    // Рендер фото в секретном разделе
    function renderSecretGallery() {
        secretGrid.innerHTML = secretPhotos.map((photo, index) => `
            <figure class="secret-photo" style="--delay:${index * 90}ms">
                <img src="${photo}" alt="Наше фото ${index + 1}" loading="lazy" onerror="this.closest('figure').classList.add('missing')">
            </figure>
        `).join('');
    }

    // Проверка пароля секретного раздела
    function unlockSecret() {
        const pass = secretInput.value.trim();
        if (pass === '2308') {
            secretUnlocked = true;
            secretError.textContent = '';
            secretGallery.classList.add('show');
            renderSecretGallery();
            setActivePage(5);
            return;
        }
        secretError.textContent = 'Неверный пароль. Попробуй ещё раз.';
    }

    // Навигация
    function setActivePage(pageNum) {
        if (pageNum === 5 && !secretUnlocked) {
            pageNum = 4;
        }

        Object.values(pages).forEach(p => p.classList.remove('active'));
        pages[pageNum].classList.add('active');
        
        dots.forEach((d, index) => {
            d.classList.remove('active');
            if (index === pageNum) d.classList.add('active');
        });

        // Скрываем навигационные точки на нулевой странице
        if (pageNum === 0) {
            navDots.style.opacity = '0';
            navDots.style.pointerEvents = 'none';
        } else {
            navDots.style.opacity = '1';
            navDots.style.pointerEvents = 'auto';
        }
    }

    // Обработчики
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActivePage(index);
        });
    });

    startBtn.addEventListener('click', () => {
        setActivePage(1);
    });

    nextToGameBtn.addEventListener('click', () => {
        setActivePage(2);
    });

    nextToGalleryBtn.addEventListener('click', () => {
        setActivePage(3);
    });

    nextToSecretBtn.addEventListener('click', () => {
        setActivePage(4);
        secretInput.focus();
    });

    openSecretBtn.addEventListener('click', () => {
        unlockSecret();
    });

    backToPasswordBtn.addEventListener('click', () => {
        setActivePage(4);
    });

    secretInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            unlockSecret();
        }
    });

    document.getElementById('reset-game').addEventListener('click', () => {
        initGame();
    });

    // Инициализация
    renderAccordion();
    initGame();

    // Скрываем навигационные точки на старте
    navDots.style.opacity = '0';
    navDots.style.pointerEvents = 'none';
})();
