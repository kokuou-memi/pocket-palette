const memberGrid = document.getElementById("memberGrid");

function renderMembers() {

    memberGrid.innerHTML = "";

    members.forEach(member => {

        const card = document.createElement("a");

        card.href = member.youtube;
        card.target = "_blank";
        card.className = "member offline";

        card.innerHTML = `
            <img src="${member.image}" alt="${member.name}">
            <span>${member.name}</span>
        `;

        memberGrid.appendChild(card);

    });

}

renderMembers();