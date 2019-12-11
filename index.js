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
        }
    });
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
    oReq.onreadystatechange = function() {
        if (oReq.readyState == XMLHttpRequest.DONE) {
            reqListener(JSON.parse(oReq.responseText));
        }
    }
    oReq.open('get', url, true);
    oReq.send();
}

function getTeam(teamID) {
    league.find((record) => {
        if(record.entry === teamID) {
            return record;
        }
    });
}
