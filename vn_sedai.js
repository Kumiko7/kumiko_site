document.addEventListener('DOMContentLoaded', () => {

    // --- 1. HARDCODED DATA ---
    // The dictionary of years to lists of strings.
    const data = {
    2024: ["Ooe", "Monmusu Quest! Paradox RPG Shuushou", "Tanetsumi no Uta", "D.C.5 ~Da Capo 5~ Future Link", "Tokyo Satsujinki Gakkou no Kaidan", "Saimin Seishidou -Secret Lesson-", "Mojibake", "18TRIP", "Pure×Holic ~Junketsu Otome to Kon'in Kankei!?~", "Unravel trigger", "Kyokkou no Marriage", "Hirusagari no Run-Down Apartment to Hitozuma-tachi 〜Heisa Kuukan de Kurui Ochiteiku〜"],
    2023: ["Amakano 2+", "Sakura no Toki -Sakura no Mori no Shita o Ayumu-", "D.C.5 ~Da Capo 5~", "even if TEMPEST: Tsuranaru Toki no Akatsuki", "Mashiro-iro Symphony: Sana Edition", "Amaenbo Fuyu", "Bunny's Mama Daikou Service", "Hirahira Hihiru", "Shuuen no Virche -EpiC:lycoris-", "BUSTAFELLOWS Season 2", "9 R.I.P.", "Dai Sengoku Rance"],
    2022: ["Ao no Kanata no Four Rhythm - EXTRA2", "BLACK SHEEP TOWN", "Hentai Prison", "Sekai Metsubou Kyouyuu Gensou MAMIYA - DoomsDay Dreams", "Motto! Haramase! Honoo no Oppai Isekai Oppai Maid Gakuen!", "Tsui no Stella", "even if TEMPEST: Yoiyami ni Kaku Katariki Majo", "HEAVEN BURNS RED", "Ayakashi Kyoushuutan", "Jewelry Hearts Academia -We will wing wonder world-", "AMBITIOUS MISSION", "Sengoku † Koihime EX 2 ~Oni no Kuni, Echizen Hen~"],
    2021: ["Tsukihime -A piece of blue glass moon-", "Jack Jeanne", "Slow Damage", "Kyonyuu Fantasy 4 -Shuudoushi Astor-", "Shuuen no Virche -ErroR:salvation-", "Meikei no Lupercalia", "Motto! Haramase! Honoo no Oppai Isekai Chou Ero ♥ Succubus Gakuen!", "Role player: Okayu Shimai no Nenmaku Portrait - Gurigucha LIVE!", "Waga Himegimi ni Eikan o", "Buddy Mission Bond", "Akuma Shitsuji to Kuroi Neko", "Tsumamitsu Neburi ~Mureta Yawahada ni Koishite…~"],
    2020: ["9-nine- Yukiiro Yukihana Yukinoato", "Mama×Holic ~Miwaku no Mama to Ama Ama Kankei~", "Hakuchuumu no Aojashin", "Kara no Shoujo - The Last Episode", "Maitetsu - Last Run!!", "Galleria no Chika Meikyuu to Majo no Ryodan", "Tsuki no Kanata de Aimashou: SweetSummerRainbow", "Amakano 2", "Tokyo 24-ku", "Summer☆Salt ~Doutei to Shojo no Fuufu~", "Cupid Parasite", "Uuultra C"],
    2019: ["Sakura, Moyu. -as the Night's, Reincarnation-", "Nukige Mitai na Shima ni Sunderu Watashi wa Dou Surya Ii Desu ka? 2", "Shin Koihime † Musou -Kakumei- Ryuuki no Taimou", "Kimi ga Shine -Tasuuketsu Death Game-", "Mamagoto ~Mama to Naisho no Ecchi Shimasho~", "Tsuki no Kanata de Aimashou", "Kin'iro Loveriche -Golden Time-", "Niizuma Tamaki ~Tamaki no Aisai Nikki + Harem End no Sorekara~", "MUSICUS!", "Eden's Ritter - Chapter 2 - Gokuetsu no Ryuukoujo Hildegard Hen", "Kazoku ~Haha to Shimai no Kyousei~", "Motto! Haramase! Honoo no Oppai Chou Ero ♡ Appli Gakuen!"],
    2018: ["Rance X -Kessen-", "Summer Pockets", "Shin Koihime † Musou -Kakumei- Son Go no Ketsumyaku", "Saiaku Naru Saiyaku Ningen ni Sasagu", "Luckydog1+bad egg", "VenusBlood:Lagoon", "Custom Order Maid 3D 2", "Shihai no Kyoudan", "Toaru Hahaoya no Ayamachi ~Yukari Sono Kouhen~", "Hebi no Cinderella", "Kyonyuu Fantasy 3 if -Artemis no Ya - Medusa no Negai-", "Love×Holic ~Miwaku no Otome to Hakudaku Kankei~"],
    2017: ["Dai Gyakuten Saiban 2 -Naruhodou Ryuunosuke no Kakugo-", "Monmusu Quest! Paradox RPG Chuushou", "Amakano ~Second Season~+", "Shigatsu Youka", "Shin Koihime † Musou -Kakumei- Souten no Haou", "Kintouka", "Kin'iro Loveriche", "FLOWERS -Le volume sur hiver-", "Bakumatsu Jinchuu Houkoku Resshiden Miburo", "Tasokare Hotel", "Silverio Trinity", "Mono no Aware wa Sai no Koro."],
    2016: ["Utawarerumono: Futari no Hakuoro", "Koshotengai no Hashihime", "FLOWERS -Le volume sur automne-", "Blackish House", "Collar x Malice", "Gin'iro, Haruka", "Maji de Watashi ni Koishinasai! A-5", "Amakano+", "Kyonyuu Fantasy Gaiden 2 After -Osutashia no Yabou-", "Bara ni Kakusareshi Verite", "Dies irae ~Interview with Kaziklu Bey~", "Akeiro Kaikitan"],
    2015: ["Sakura no Uta -Sakura no Mori no Ue o Mau-", "Fata Morgana no Yakata -Another Episodes-", "Taishou Mebiusline Teito Bibouroku", "Schwarzesmarken", "Rance 03 - Leazas Kanraku", "FLOWERS -Le volume sur été-", "Utawarerumono: Itsuwari no Kamen", "Taishou x Alice", "Monmusu Quest! Paradox RPG Zenshou", "Soushuu Senshinkan Gakuen: Bansenjin", "Shin Koihime † Eiyuutan", "Yoshiwara Higanbana"],
    2014: ["CHAOS;CHILD", "Rance IX - Helman Kakumei -", "Ao no Kanata no Four Rhythm", "Soushuu Senshinkan Gakuen: Hachimyoujin", "Tokyo 7th Sisters", "Kami no Ue no Mahoutsukai", "AstralAir no Shiroki Towa", "Kyonyuu Fantasy 2 if", "Code: Realize ~Sousei no Himegimi~", "Ayakashi Gohan", "Hoshi Ori Yume Mirai", "ChuSinGura 46+1 Bushi no Kodou"],
    2013: ["Sengoku † Koihime ~Otome Kenran ☆ Sengoku Emaki~", "Kara no Shoujo - The Second Episode", "Ken ga Kimi", "Kyonyuu Fantasy Gaiden 2", "Monmusu Quest! Shuushou ~Makereba Youjo ni Okasareru~", "ChuSinGura 46+1", "Fate/EXTRA CCC", "Monobeno -Happy End-", "Otome Riron to Sono Shuuhen -Ecole de Paris-", "Grisaia no Rakuen -LE EDEN DE LA GRISAIA-", "Omertà Code:Tycoon", "Maji de Watashi ni Koishinasai! A-1"],
    2012: ["Fata Morgana no Yakata", "Mahoutsukai no Yoru", "Taishou Mebiusline", "Irotoridori no Hikari", "Kyokugen Dasshutsu ADV - Zennin Shibou Desu", "Mahou Shoujo", "Maji de Watashi ni Koishinasai! S", "Black Wolves Saga -Bloody Nightmare-", "Rose Guns Days", "Super Dangan Ronpa 2 Sayonara Zetsubou Gakuen", "Hatsuyuki Sakura", "Black Wolves Saga -Last Hope-"],
    2011: ["Shingakkou -Noli me tangere-", "Rewrite", "Shinigami to Shoujo", "Aiyoku no Eustia", "Gyakuten Kenji 2", "Grisaia no Kajitsu -LE FRUIT DE LA GRISAIA-", "Kajiri Kamui Kagura", "Kamidori Alchemy Meister", "Irotoridori no Sekai", "ChuSinGura 46+1 Edo Kyuushin-ha Hen", "Hanayaka Nari, Waga Ichizoku Kinema Mosaic", "Monmusu Quest! Chuushou ~Makereba Youjo ni Okasareru~"],
    2010: ["WHITE ALBUM2", "Subarashiki Hibi ~Furenzoku Sonzai~", "Muv-Luv Unlimited: The Day After", "Ikusa Megami Verita", "Albatross Koukairoku", "Clock Zero ~Shuuen no Ichibyou~", "Tokimeki Memorial Girl's Side: 3rd Story", "Rui wa Tomo o Yobu Fan Disc -Asu no Mukou ni Mieru Kaze-", "Shiei no Sona-Nyl ~What a beautiful memories~", "Akatsuki no Goei ~Tsumibukaki Shuumatsuron~", "Evolimit", "Hanayaka Nari, Waga Ichizoku"],
    2009: ["STEINS;GATE", "Umineko no Naku Koro ni Chiru", "Soukou Akki Muramasa", "BALDR SKY Dive2 \"RECORDARE\"", "Ore-tachi ni Tsubasa wa Nai", "Bengarachou Hakubutsushi", "Maji de Watashi ni Koi Shinasai!", "Kitto, Sumiwataru Asairo Yori mo,", "Kyokugen Dasshutsu - 9-Jikan 9-Nin 9 no Tobira", "Luckydog1", "Joker no Kuni no Alice ~Wonderful Wonder World~", "BALDR SKY Dive1 \"Lost Memory\""],
    2008: ["Kagerou Touryuuki", "428 ~Fuusa Sareta Shibuya de~", "Ikusa Megami Zero", "G-senjou no Maou", "Harukanaru Toki no Naka de 4", "Rui wa Tomo o Yobu", "Amatsukaze ~Kugutsu Jinpuu-chou~", "Kara no Shoujo", "Twinkle ☆ Crusaders", "Hakuouki ~Shinsengumi Kitan~", "Biniku no Kaori ~Netori Netorare Yari Yarare~", "Shin Koihime † Musou ~Otome Ryouran ☆ Sangokushi Engi~"],
    2007: ["Umineko no Naku Koro ni", "Little Busters!", "Tobira no Densetsu ~Kaze no Tsubasa~", "Ar Tonelico II ~Sekai ni Hibiku Shoujo-tachi no Metafalica~", "Clover no Kuni no Alice ~Wonderful Wonder World~", "Kyojin-tachi", "Mahou Gengo Lyrical ☆ Lisp", "Iriya no Sora, UFO no Natsu II", "Rondo Leaflet", "Gekkou no Carnevale", "Nyuuki Taisai", "Saiminjutsu 2"],
    2006: ["Muv-Luv Alternative", "Sengoku Rance", "Lamento -BEYOND THE VOID-", "Kikaijikake no Eve ~Dea Ex Machina~", "ef - a fairy tale of the two.", "Extravaganza ~Mushi Mederu Shoujo~", "Kishin Hishou Demonbane", "Laughter Land", "Tsuma Shibori", "Kono Aozora ni Yakusoku o", "Shoujo Senki Soul Eater \"Donna ni Kegasarete mo... Watashi no Fukushuu wa Owaranai!!\"", "Tokimeki Memorial Girl's Side: 2nd Kiss"],
    2005: ["Silver Jiken 25 Ku", "Saihate no Ima", "Sharin no Kuni, Himawari no Shoujo", "Fate/hollow ataraxia", "Harukanaru Toki no Naka de 3: Izayoiki", "Princess Maker 4", "Gunjou no Sora o Koete", "Princess Witches", "Parfait ~Chocolat Second Brew~", "Animamundi ~Owarinaki Yami no Butou~", "Galzoo Island", "SWAN SONG"],
    2004: ["Higurashi no Naku Koro ni Kai", "CLANNAD", "Fate/stay night", "Gyakuten Saiban 3", "Remember11 -the age of infinity-", "Symphonic Rain", "Akai Ito", "Harukanaru Toki no Naka de 3", "Nurse Witch Komugi-chan Magikarte", "Rance VI - Zeth Houkai -", "planetarian ~Chiisana Hoshi no Yume~", "Kazoku Keikaku ~Soshite Mata Kazoku Keikaku o~"],
    2003: ["My Merry Maybe", "Hanakisou", "Bara no Ki ni Bara no Hanasaku", "Saya no Uta", "CROSS†CHANNEL", "Kawarazaki-ke no Ichizoku 2", "Genrin no Kishougun 2 ~Michibikareshi Tamashii no Keifu~", "Shin Aniyome", "Eien no Aselia -The Spirit of Eternity Sword-", "Ippai Shimasho", "TRUE REMEMBRANCE", "SNOW"],
    2002: ["Higurashi no Naku Koro ni", "Ever17 -the out of infinity-", "\"Hello, world.\"", "Kusarihime ~Euthanasia~", "Utawarerumono", "Ore no Shita de Agake", "Suigetsu", "Sumeragi no Miko-tachi", "Gyakuten Saiban 2", "Princess Knights", "BALDR FORCE", "Ikusa Megami 2 ~Ushinawareshi Kioku e no Chinkonka~"],
    2001: ["Sakura Taisen 3 ~Paris wa Moeteiru ka~", "Gyakuten Saiban", "Kisaku", "Sayonara o Oshiete ~Comment te Dire Adieu~", "Kimi ga Nozomu Eien", "Memories Off 2nd", "Mission Slave Goumon Yuugi", "Daiakuji", "Canary", "Close to ~Inori no Oka~", "Pandora no Yume", "Kazoku Keikaku"],
    2000: ["Tsukihime", "Phantom -PHANTOM OF INFERNO-", "AIR", "Hateshinaku Aoi, Kono Sora no Shita de...", "Nijuuei", "Dorei Ichiba", "Shoin, Aruiwa Ushinawareta Yume no Monogatari.", "Gin'iro", "Elysion ~Eien no Sanctuary~", "Kao no nai Tsuki", "Kaseki no Uta", "Harukanaru Toki no Naka de"]
};

    // --- 2. GET DOM ELEMENTS ---
    const tableBody = document.querySelector("#data-table tbody");
    const copyBtn = document.getElementById("copy-btn");
    const tableElement = document.getElementById("data-table");

    // --- 3. GENERATE TABLE ---
    function generateTable() {
        // Clear any existing rows
        tableBody.innerHTML = ''; 

        // Loop through the data object (e.g., [2024, ["Project Alpha", ...]])
        for (const [year, items] of Object.entries(data)) {
            const row = document.createElement('tr');

            // Create and append the year cell
            const yearCell = document.createElement('td');
            yearCell.textContent = year;
            row.appendChild(yearCell);

            // Create and append cells for each string item
            items.forEach(itemText => {
                const itemCell = document.createElement('td');
                itemCell.textContent = itemText;
                row.appendChild(itemCell);
            });

            tableBody.appendChild(row);
        }
    }

    // --- 4. HANDLE CELL HIGHLIGHTING ---
    // Use event delegation on the table body for efficiency
    tableBody.addEventListener('click', (event) => {
        const clickedCell = event.target;

        // Check if the clicked element is a TD and not the first one (the year)
        if (clickedCell.tagName === 'TD' && clickedCell.cellIndex > 0) {
            clickedCell.classList.toggle('highlighted');
        }
    });

    // --- 5. HANDLE COPY IMAGE BUTTON ---
    copyBtn.addEventListener('click', async () => {
        const originalButtonText = copyBtn.textContent;
        copyBtn.textContent = 'Generating...';

        try {
            // Use html2canvas to render the table element onto a canvas
            const canvas = await html2canvas(tableElement, {
                // Options to improve image quality
                scale: 2, 
                useCORS: true, 
            });

            // Convert the canvas to a Blob (binary image data)
            canvas.toBlob(async (blob) => {
                try {
                    // Use the modern Clipboard API to write the image blob
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);

                    // Give user feedback
                    copyBtn.textContent = 'Copied to Clipboard!';
                } catch (err) {
                    console.error('Failed to copy image to clipboard:', err);
                    copyBtn.textContent = 'Copy Failed!';
                } finally {
                    // Reset button text after 2 seconds
                    setTimeout(() => {
                        copyBtn.textContent = originalButtonText;
                    }, 2000);
                }
            }, 'image/png');

        } catch (err) {
            console.error('html2canvas failed:', err);
            copyBtn.textContent = 'Error!';
             setTimeout(() => {
                copyBtn.textContent = originalButtonText;
            }, 2000);
        }
    });

    // --- INITIALIZE ---
    // Call the function to build the table when the page loads.
    generateTable();
});