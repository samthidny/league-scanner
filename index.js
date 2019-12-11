var league = [];
var players = [];
var standings = [];
var teamCount = 0;

// Load live player data
get('https://fantasy.premierleague.com/api/event/16/live/', (data) => {
    players = data.elements;
    loadLeague();
});

// Load League Standings
function loadLeague() {
    get('https://fantasy.premierleague.com/api/leagues-classic/62960/standings/?page_new_entries=1&page_standings=1&phase=1', (data) => {
        league = data.standings.results;
        standings = data.league;
        loadAllTeams(league);
    });
}

// Load each teams live data in the league
function loadAllTeams(teams) {
    teams.forEach(team => {
        updateTeam(team);
    });
}

function updateTeam(team) {
    const teamID = team.entry;
    teamCount = 0;
    get(`https://fantasy.premierleague.com/api/entry/${teamID}/event/16/picks/`, (data) => {
        team.liveData = data;
        teamCount++;
        if (teamCount === league.length) {
            sortStandings();
            displayLeague();

            start();
        }
    });
}

function commonPlayers() {
    var playerCount = {};
    league.forEach((team) => {
        team.liveData.picks.forEach((pick) => {
            playerID = pick.element;
            if (playerCount[playerID]) {
                playerCount[playerID]++;
            } else {
                playerCount[playerID] = 1;
            }
        });
    });

    var arr = [];
    for (var p in playerCount) {
        arr.push({
            id: p,
            count: playerCount[p]
        });
    }

    return arr;
}

function sortStandings() {
    //find team in standings
    league.sort((a, b) => {
        return b.liveData.entry_history.points - a.liveData.entry_history.points;
    });
}

function displayLeague() {
    league.forEach((record) => {
        console.log(`${record.player_name} - ${record.entry_name} - ${record.liveData.entry_history.points} - ${record.total}`);
    });
}

function reqError(err) {
    console.log('Fetch Error :-S', err);
}

function get(url, reqListener) {
    var oReq = new XMLHttpRequest();
    //oReq.onload = reqListener;
    oReq.onerror = reqError;
    oReq.onreadystatechange = function () {
        if (oReq.readyState == XMLHttpRequest.DONE) {
            reqListener(JSON.parse(oReq.responseText));
        }
    }
    oReq.open('get', url, true);
    oReq.send();
}




function sortBy(field, desc) {
    if (desc) {
        return function (a, b) {
            return b[field] - a[field];
        }
    } else {
        return function (a, b) {
            return a[field] - b[field];
        }
    }
}

function getPlayer(id) {
    return players.find(player => {
        return player.id === parseInt(id, 10);
    });
}

function start() {


    var playerTotals = commonPlayers();
    playerTotals = playerTotals.sort(sortBy('count', true));

    var data = playerTotals.map(countrec => {
        return {
            player: getPlayer(countrec.id),
            count: countrec.count
        };
    });

    console.log(data);

    debugger;


}