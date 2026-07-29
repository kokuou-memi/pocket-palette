const API_KEY = "AIzaSyB2O6szcgjQI_1gx_cYcoyKei4kmtXOIAA";

async function updateLives() {

    const liveIds = [];

    await Promise.all(
        members.map(async (member) => {

            const url =
                `https://www.googleapis.com/youtube/v3/search?` +
                `part=id` +
                `&channelId=${member.channelId}` +
                `&eventType=live` +
                `&type=video` +
                `&key=${API_KEY}`;

            try {

                const response = await fetch(url);
                const data = await response.json();

                if (data.items && data.items.length > 0) {
                    liveIds.push(member.channelId);
                }

            } catch (e) {
                console.error(member.name, e);
            }

        })
    );

    renderMembers(liveIds);
}

updateLives();

setInterval(updateLives, 60000);