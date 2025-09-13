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

    // Simplified this function to take only one URL
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

    // REMOVED the complex getEarliestDeveloper function entirely.

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
            
            // MODIFIED: Added `developers{id, name}` to the fields to fetch them directly.
            const vnResponse = await vndbRequest({
                filters: ["id", "=", dailyVnId],
                fields: "id, title, released, developers{id, name}, tags{id, rating, name}",
            });

            if (!vnResponse || vnResponse.results.length === 0) throw new Error(`Could not find VN with ID '${dailyVnId}'`);

            dailyVn = vnResponse.results[0];
            
            // NEW: Get the primary developer from the fetched `developers` array.
            // We take the first one listed as the primary one for the game.
            dailyVn.developer = dailyVn.developers && dailyVn.developers.length > 0 ? dailyVn.developers[0] : null;

            dailyVn.tags.forEach(tag => dailyVnTagMap.set(tag.id, tag));
            
            console.log(`Daily VN for ${jstDateString} (JST) is: ${dailyVn.title}`);
            console.log(`Daily VN Developer:`, dailyVn.developer);

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
        
        // MODIFIED: Added `developers{id, name}` to the fields.
        const guessDataResponse = await vndbRequest({
            filters: ["id", "=", vnId],
            fields: "id, title, released, developers{id, name}, tags{id, rating, name}",
        });

        if (!guessDataResponse || guessDataResponse.results.length === 0) {
            alert("Could not fetch data for the selected VN.");
            return;
        }

        const guessedVn = guessDataResponse.results[0];
        
        // NEW: Get the primary developer from the fetched `developers` array.
        guessedVn.developer = guessedVn.developers && guessedVn.developers.length > 0 ? guessedVn.developers[0] : null;

        const comparisonResult = compareVns(guessedVn);
        guessHistory.push(comparisonResult);
        renderGuess(comparisonResult);

        if (guessedVn.id === dailyVn.id) {
            gameOver = true;
            showWinScreen();
        }
    }
    
    function compareVns(guessedVn) {
        // Year comparison logic (unchanged)
        let releaseComparison = 'unknown';
        const dailyVnYear = dailyVn.released ? parseInt(dailyVn.released.substring(0, 4), 10) : null;
        const guessedVnYear = guessedVn.released ? parseInt(guessedVn.released.substring(0, 4), 10) : null;

        if (dailyVnYear && guessedVnYear) {
            if (dailyVnYear > guessedVnYear) releaseComparison = 'newer';
            else if (dailyVnYear < guessedVnYear) releaseComparison = 'older';
            else releaseComparison = 'same';
        }

        // Developer comparison logic (unchanged, but now receives more reliable data)
        let developerComparison = 'unknown';
        if (dailyVn.developer && guessedVn.developer) {
            developerComparison = dailyVn.developer.id === guessedVn.developer.id ? 'correct' : 'incorrect';
        } else if (dailyVn.developer || guessedVn.developer) {
            developerComparison = 'incorrect';
        }

        const result = { 
            id: guessedVn.id, 
            title: guessedVn.title, 
            tags: [],
            releaseDate: guessedVn.released,
            releaseComparison: releaseComparison,
            developer: guessedVn.developer,
            developerComparison: developerComparison
        };

        if (!guessedVn.tags) return result;

        guessedVn.tags.forEach(guessedTag => {
			if (guessedTag.rating > 0.0) {
				let status = 'incorrect';
				let dailyRating = 0;
				if (dailyVnTagMap.has(guessedTag.id)) {
					const dailyTag = dailyVnTagMap.get(guessedTag.id);
					dailyRating = dailyTag.rating
					if (dailyRating > 0.0) {
						status = dailyRating < 1.9 ? 'partial' : 'correct';
					}
				}
				result.tags.push({ name: guessedTag.name, status, rating: dailyRating, guessRating: guessedTag.rating});
			}
        });

        const sortOrder = { correct: 0, partial: 1, incorrect: 2 };
        result.tags.sort((a, b) => {
            const statusDifference = sortOrder[a.status] - sortOrder[b.status];
            if (statusDifference !== 0) {
                return statusDifference; // Primary sort by status
            }
            // If status is the same, secondary sort by rating (descending)
			if (b.rating - a.rating !== 0 && sortOrder[a.status] !== 2) {
				return b.rating - a.rating;
			}
            return b.guessRating - a.guessRating;
        });
        return result;
    }
    
    function renderGuess(result) {
        const TAG_COLLAPSE_THRESHOLD = 15;
        const guessRow = document.createElement('div');
        guessRow.className = 'guess-row';

        const titleEl = document.createElement('h3');
        titleEl.className = 'guess-title';
        titleEl.textContent = `${guessHistory.length}. ${result.title}`;
        guessRow.appendChild(titleEl);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'guess-content-wrapper';
		
		const infoRow = document.createElement('div');
        infoRow.className = 'info-row';

        // Release Year Indicator
        const dateIndicator = document.createElement('div');
        dateIndicator.className = 'release-date-indicator';
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'arrow';
        const dateSpan = document.createElement('span');
        dateSpan.className = 'date';
        dateSpan.textContent = result.releaseDate ? result.releaseDate.substring(0, 4) : 'Unknown';

        switch (result.releaseComparison) {
            case 'newer':
                arrowSpan.textContent = '⬆️';
                dateIndicator.title = 'The daily VN was released in a LATER year.';
                break;
            case 'older':
                arrowSpan.textContent = '⬇️';
                dateIndicator.title = 'The daily VN was released in an EARLIER year.';
                break;
            case 'same':
                arrowSpan.textContent = '✅';
                dateIndicator.title = 'Released in the same year as the daily VN.';
                break;
            default: // unknown
                arrowSpan.textContent = '❔';
                dateIndicator.title = 'Release year could not be compared.';
                break;
        }

        dateIndicator.appendChild(arrowSpan);
        dateIndicator.appendChild(dateSpan);
        infoRow.appendChild(dateIndicator);

        // Developer Indicator (this part is now fed with correct data)
        const developerIndicator = document.createElement('div');
        developerIndicator.className = `developer-indicator ${result.developerComparison}`;
        developerIndicator.textContent = result.developer ? result.developer.name : 'Developer Unknown';
        developerIndicator.title = `Developer: ${result.developer ? result.developer.name : 'Unknown'}`;
		
		infoRow.appendChild(developerIndicator);
        contentWrapper.appendChild(infoRow);

        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container'; // New class for flex/grid styling

        if (result.tags.length > 0) {
            // Left column for Correct and Partial tags
            const leftColumn = document.createElement('div');
            leftColumn.className = 'tags-column';

            // Right column for Incorrect tags
            const rightColumn = document.createElement('div');
            rightColumn.className = 'tags-column';

            result.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = `tag tag-${tag.status}`;
                tagEl.textContent = tag.name;

                if (tag.status === 'correct' || tag.status === 'partial') {
                    leftColumn.appendChild(tagEl);
                } else { // 'incorrect'
                    rightColumn.appendChild(tagEl);
                }
            });

            tagsContainer.appendChild(leftColumn);
            tagsContainer.appendChild(rightColumn);
        } else {
            tagsContainer.textContent = 'No tags to display for this entry.';
        }
        
        contentWrapper.appendChild(tagsContainer);
        guessRow.appendChild(contentWrapper);

        // Apply collapse logic to the new parent container
        if (result.tags.length > TAG_COLLAPSE_THRESHOLD) {
            guessRow.classList.add('collapsible');
            tagsContainer.classList.add('collapsed');
            guessRow.addEventListener('click', () => tagsContainer.classList.toggle('collapsed'));
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
            
            switch (guess.releaseComparison) {
                case 'newer': line += '⬆️'; break;
                case 'older': line += '⬇️'; break;
                case 'same':  line += '✅'; break;
                default:      line += '❔'; break;
            }

            let devMarker = '⚪';
            if (guess.developerComparison === 'correct') {
                devMarker = '🟢';
            } else if (guess.developerComparison === 'incorrect') {
                devMarker = '🔴';
            }
            line += ` ${devMarker} `;

            const green = guess.tags.filter(t => t.status === 'correct').length;
            const yellow = guess.tags.filter(t => t.status === 'partial').length;
            const red = guess.tags.filter(t => t.status === 'incorrect').length;
			line += `🟩${green} 🟨${yellow} 🟥${red}\n`;       
			
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