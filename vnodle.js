document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loadingEl = document.getElementById('loading');
    const gameAreaEl = document.getElementById('game-area');
    const inputEl = document.getElementById('vn-input');
    const searchResultsEl = document.getElementById('search-results');
    const guessesContainerEl = document.getElementById('guesses-container');
    const winScreenEl = document.getElementById('win-screen');
    const winVnTitleEl = document.getElementById('win-vn-title');
    const guessCountEl = document.getElementById('guess-count');
    const shareButtonEl = document.getElementById('share-button');

    // --- Game State ---
    const API_URL = 'https://api.vndb.org/kana/vn';
    let dailyVn = null;
    let dailyVnTagMap = new Map();
    let guessHistory = [];
    let gameOver = false;
    let searchDebounceTimer;
    let jstDateString = '';

    // --- Main Game Logic ---
    
    async function vndbRequest(body) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("VNDB API Request Failed:", error);
            alert("Failed to communicate with the VNDB API. The service might be down or you might be rate-limited. Please try again later.");
            return null;
        }
    }

    async function init() {
        const startDate = new Date('2025-08-29T00:00:00Z');
        
        try {
            const response = await fetch('vn_list.json');
            if (!response.ok) throw new Error('vn_list.json not found or could not be loaded.');
            const vnList = await response.json();

            const jstFormatter = new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
            });
            jstDateString = jstFormatter.format(new Date());
            const currentDate = new Date(jstDateString + 'T00:00:00Z');
            const timeDifference = currentDate - startDate;
            const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            if (daysPassed < 0) throw new Error("The start date is in the future.");

            const listIndex = daysPassed % vnList.length;
            const dailyVnId = vnList[listIndex];
            
            // ADDED `released` to fields
            const vnResponse = await vndbRequest({
                filters: ["id", "=", dailyVnId],
                fields: "id, title, released, tags{id, rating, name}",
            });

            if (!vnResponse || vnResponse.results.length === 0) throw new Error(`Could not find VN with ID '${dailyVnId}'`);

            dailyVn = vnResponse.results[0];
            dailyVn.tags.forEach(tag => dailyVnTagMap.set(tag.id, tag));
            
            console.log(`Daily VN for ${jstDateString} (JST) is: ${dailyVn.title}`);

            loadingEl.classList.add('hidden');
            gameAreaEl.classList.remove('hidden');

        } catch (error) {
            console.error("Initialization failed:", error);
            loadingEl.innerHTML = `<p style="color: #f44336;">Error: ${error.message}</p>`;
        }
    }

    async function handleSearch(event) {
        const query = event.target.value;
        searchResultsEl.innerHTML = '';
        if (query.length < 3) return;
        const searchData = await vndbRequest({
            filters: ["search", "=", query],
            fields: "id, title",
            results: 10,
        });
        if (searchData && searchData.results) {
            searchData.results.forEach(vn => {
                const li = document.createElement('li');
                li.textContent = vn.title;
                li.dataset.id = vn.id;
                li.dataset.title = vn.title;
                li.addEventListener('click', handleGuessSelection);
                searchResultsEl.appendChild(li);
            });
        }
    }
    
    async function handleGuessSelection(event) {
        if (gameOver) return;
        const vnId = event.target.dataset.id;
        inputEl.value = '';
        searchResultsEl.innerHTML = '';
        
        // ADDED `released` to fields
        const guessDataResponse = await vndbRequest({
            filters: ["id", "=", vnId],
            fields: "id, title, released, tags{id, rating, name}",
        });

        if (!guessDataResponse || guessDataResponse.results.length === 0) {
            alert("Could not fetch data for the selected VN.");
            return;
        }

        const guessedVn = guessDataResponse.results[0];
        const comparisonResult = compareVns(guessedVn);
        guessHistory.push(comparisonResult);
        renderGuess(comparisonResult);

        if (guessedVn.id === dailyVn.id) {
            gameOver = true;
            showWinScreen();
        }
    }
    
    function compareVns(guessedVn) {
        // ADDED release date comparison logic
        let releaseComparison = 'unknown';
        if (dailyVn.released && guessedVn.released) {
            if (dailyVn.released > guessedVn.released) releaseComparison = 'newer';
            else if (dailyVn.released < guessedVn.released) releaseComparison = 'older';
            else releaseComparison = 'same';
        }

        const result = { 
            id: guessedVn.id, 
            title: guessedVn.title, 
            tags: [],
            releaseDate: guessedVn.released, // Store the date for display
            releaseComparison: releaseComparison // Store the comparison result
        };

        if (!guessedVn.tags) return result;

        guessedVn.tags.forEach(guessedTag => {
            let status = 'incorrect';
            if (dailyVnTagMap.has(guessedTag.id)) {
                const dailyTag = dailyVnTagMap.get(guessedTag.id);
				if (dailyTag > 0.5) {
					status = Math.abs(dailyTag.rating - guessedTag.rating) > 1 ? 'partial' : 'correct';
				}
            }
            result.tags.push({ name: guessedTag.name, status });
        });

        const sortOrder = { correct: 0, partial: 1, incorrect: 2 };
        result.tags.sort((a, b) => sortOrder[a.status] - sortOrder[b.status]);
        return result;
    }
    
    function renderGuess(result) {
        const TAG_COLLAPSE_THRESHOLD = 20;
        const guessRow = document.createElement('div');
        guessRow.className = 'guess-row';

        const titleEl = document.createElement('h3');
        titleEl.className = 'guess-title';
        titleEl.textContent = `${guessHistory.length}. ${result.title}`;
        guessRow.appendChild(titleEl);

        // --- NEW: Create date indicator and wrapper ---
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'guess-content-wrapper';

        const dateIndicator = document.createElement('div');
        dateIndicator.className = 'release-date-indicator';

        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'arrow';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'date';
        dateSpan.textContent = result.releaseDate || 'Unknown';

        switch (result.releaseComparison) {
            case 'newer':
                arrowSpan.textContent = '⬆️';
                dateIndicator.title = 'The daily VN was released AFTER this one.';
                break;
            case 'older':
                arrowSpan.textContent = '⬇️';
                dateIndicator.title = 'The daily VN was released BEFORE this one.';
                break;
            case 'same':
                arrowSpan.textContent = '✅';
                dateIndicator.title = 'Released on the same date as the daily VN.';
                break;
            default: // unknown
                arrowSpan.textContent = '❔';
                dateIndicator.title = 'Release date could not be compared.';
                break;
        }

        dateIndicator.appendChild(arrowSpan);
        dateIndicator.appendChild(dateSpan);
        contentWrapper.appendChild(dateIndicator); // Add date indicator to wrapper

        const tagsList = document.createElement('div');
        tagsList.className = 'tags-list';
        if (result.tags.length > 0) {
            result.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = `tag tag-${tag.status}`;
                tagEl.textContent = tag.name;
                tagsList.appendChild(tagEl);
            });
        } else {
            tagsList.textContent = 'No tags to display for this entry.';
        }
        
        contentWrapper.appendChild(tagsList); // Add tag list to wrapper
        guessRow.appendChild(contentWrapper); // Add wrapper to the main row

        if (result.tags.length > TAG_COLLAPSE_THRESHOLD) {
            guessRow.classList.add('collapsible');
            tagsList.classList.add('collapsed');
            guessRow.addEventListener('click', () => tagsList.classList.toggle('collapsed'));
        }
        
        guessesContainerEl.appendChild(guessRow);
    }
    
    function showWinScreen() {
        gameAreaEl.classList.add('hidden');
        winScreenEl.classList.remove('hidden');
        winVnTitleEl.textContent = dailyVn.title;
        guessCountEl.textContent = guessHistory.length;
        
        let shareContent = `VNDB-le ${jstDateString} - ${guessHistory.length} Guesses | https://kumiko7.github.io/kumiko_site/vnodle.html\n\n`;
        guessHistory.forEach((guess, index) => {
			let line = `Guess ${index + 1}: `;
            
            // Add the release date arrow at the start of the line
            switch (guess.releaseComparison) {
                case 'newer': line += '⬆️'; break;
                case 'older': line += '⬇️'; break;
                case 'same':  line += '✅'; break;
                default:      line += '❔'; break;
            }
            const green = guess.tags.filter(t => t.status === 'correct').length;
            const yellow = guess.tags.filter(t => t.status === 'partial').length;
            const red = guess.tags.filter(t => t.status === 'incorrect').length;
            line += `${'🟩'.repeat(green)}${'🟨'.repeat(yellow)}${'🟥'.repeat(red)}\n`;
            
            shareContent += line;
        });
        document.getElementById('share-text').value = shareContent.trim();
    }
    
    function shareResults() {
        const shareText = document.getElementById('share-text').value;
        navigator.clipboard.writeText(shareText).then(() => {
            shareButtonEl.textContent = 'Copied!';
            setTimeout(() => { shareButtonEl.textContent = 'Share Results'; }, 2000);
        });
    }

    inputEl.addEventListener('input', (e) => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => handleSearch(e), 300);
    });
    shareButtonEl.addEventListener('click', shareResults);

    init();
});