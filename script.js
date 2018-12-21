/**
 * Cette page sert a macher tous le travail répétitif quand on fais de la playlist
 * Soumettre les idées :
 * - localstorage done on pourrait pouvoir telecharger le fichier
 * - parser les mp3 pour ne rien taper
 */

console.log("Playlist-tool start")

//Helpers
let inputFitContent = function(input){
    input.style.width = Math.max( ((input.value.length + 1) * 10), 173) + "px"
}

let createLabelDiv = function(labelString){
    let label = document.createElement("div")
    label.classList.add("label")
    label.classList.add("noselect")
    label.innerHTML = labelString
    return label
}

//return a div containing a label + inpu
let createLabelInputText = function(labelString, initValue, callback){
    
    let label = createLabelDiv(labelString)
    
    let input = document.createElement("input")
    input.type = "text"
    input.onkeypress = callback
    input.onchange = callback
    input.value = initValue
    
    let container = document.createElement("div")
    container.appendChild(label)
    container.appendChild(input)

    inputFitContent(input)

    return container
}

let createLabelInputTime = function(labelString, callback, initValue){
    
    let label = createLabelDiv(labelString)
    
    let input = document.createElement("input")
    input.type = "time"
    input.step = 1 //force sec to appear
    if(initValue){
        input.value = initValue
    }else{
        input.value = "00:00:00"
    }
    input.onchange = callback
    
    let container = document.createElement("div")
    container.appendChild(label)
    container.appendChild(input)

    return container
}

//track obj
let newTrackObj = function(index, start, artist, title){

    return {
        //attr
        index: index,
        title: title,
        artist: artist,
        start:start,
        end:start,
        html: null
    }
}

//method
let computeDurationString = function(trackObj){
    let endMs = time2Ms(trackObj.end)
    let startMs = time2Ms(trackObj.start)
    let duration = endMs - startMs
    return "Durée = " + time2String(ms2Time(duration)) + " </br> "+duration+" ms"
}

let createTrackDiv = function(playlist, trackObj){
    
    //list
    let list = document.getElementById("tracks-list")

    //create a track div
    let trackDiv = document.createElement("div")
    trackDiv.classList.add("tracks-list-track")
    trackObj.html = trackDiv

    //artist
    let cbArtist = function(evt){
        trackObj.artist = evt.target.value
        inputFitContent(evt.target)
        onDataChanged(playlist)
    }
    let artistDiv = createLabelInputText("Artiste", trackObj.artist, cbArtist)
    
    //title
    let cbTitle = function(evt){
        trackObj.title = evt.target.value
        inputFitContent(evt.target)
        onDataChanged(playlist)
    }
    let titleDiv = createLabelInputText("Titre", trackObj.title, cbTitle)
    
    //duration
    let infoDuration = createLabelDiv("")
    infoDuration.innerHTML = computeDurationString(trackObj)

    //startTime
    let cbStart = function(evt){
        trackObj.start = ms2Time(evt.target.valueAsNumber)
        infoDuration.innerHTML = computeDurationString(trackObj)
        onDataChanged(playlist)
    }
    let startTimeDiv = createLabelInputTime("Commence à", cbStart,time2String(trackObj.start))
    
    //endTime
    let cbEnd = function(evt){
        trackObj.end = ms2Time(evt.target.valueAsNumber)
        infoDuration.innerHTML = computeDurationString(trackObj)
        onDataChanged(playlist)
    }
    let endTimeDiv = createLabelInputTime("Finit à", cbEnd, time2String(trackObj.end))

    //index
    let infoIndex = createLabelDiv(trackObj.index)

    //delete button
    let deleteDiv = document.createElement("div")
    deleteDiv.innerHTML = "Supprimer"
    deleteDiv.classList.add("small-button")
    deleteDiv.classList.add("noselect")
    deleteDiv.onclick = function(evt){
        //remove from tracks
        for(let i= 0; i<playlist.tracks.length; i++){
            let t = playlist.tracks[i]
            if(t == trackObj){
                playlist.tracks.splice(i,1)
                list.removeChild(t.html)
            }
        }
        //recompute index and div associated
        for(let i= 0; i < playlist.tracks.length; i++){
            let t = playlist.tracks[i]
            t.index = i + 1
            t.html.firstChild.innerHTML = t.index
        }

        onDataChanged(playlist)
    }
    
    //add to parent
    trackDiv.appendChild(infoIndex)
    trackDiv.appendChild(artistDiv)
    trackDiv.appendChild(titleDiv)
    trackDiv.appendChild(startTimeDiv)
    trackDiv.appendChild(endTimeDiv)
    trackDiv.appendChild(infoDuration)
    trackDiv.appendChild(deleteDiv)

    list.appendChild(trackDiv)
}

//local storage
let saveTolocalStorage = function(playlist){
    localStorage.setItem("playlist", JSON.stringify(playlist))
}

let metadataDiv = document.getElementById("tracks-metadata-container") 
let descriptionDiv = document.createElement("div")
metadataDiv.appendChild(descriptionDiv)
let generateDescription = function(playlist){
    let description = "Les playlist du jailln et de la mache - Every month a playlist on a particular theme or music genre."
    description += "<br/><br/>"
    description += playlist.title + " Playlist"
    description += "<br/><br/>"
    playlist.tracks.forEach(function(track){
        description += track.index + " - " + track.artist + " - " + track.title + " " + time2String(track.start)
        description += "<br/>"
    })
    description += "<br/>"
    description += "We do not own the copyrights. If you are the owner and you don't want to see your music here, please contact us and we will remove it."

    descriptionDiv.innerHTML = description
}

let loadFromLocalStorage = function(){

    let playlist = null
    let playlistString = localStorage.getItem("playlist")
    if(playlistString){
        playlist = JSON.parse(playlistString)
    }

    if(!playlist){//} || !confirm("Charger la derniere playlist ?")){
        
        playlist = {
            title:"",
            tracks: []
        }

    }

    //update ui from playlist
    playlist.tracks.forEach(function(track){
        createTrackDiv(playlist, track)
    });

    generateDescription(playlist)

    return playlist
}

// Time
let ms2Time = function(value){
    
    let result = {
        sec: 0,
        min: 0,
        hour: 0
    }
    
    //value is ms
    value /= 1000
    //value is sec
    result.hour = Math.floor(value/3600)
    value -= result.hour * 3600
    result.min = Math.floor(value/60)
    value -= result.min * 60
    result.sec = value
    
    return result
}

let time2Ms = function(value){
    return 1000 * (value.hour * 3600 + value.min * 60 + value.sec)
}

let time2String = function(time){
    let result = ""
    if(time.hour < 10){
        result += "0"+time.hour
    }else{
        result += time.hour
    }
    result += ":"
    
    if(time.min < 10){
        result += "0"+time.min
    }else{
        result += time.min
    }
    result += ":"
    
    if(time.sec < 10){
        result += "0"+time.sec
    }else{
        result += time.sec
    }

    return result
}

let defaultTime = {
    hour:0,
    min:0,
    sec:0
}

// Main

let playlist = loadFromLocalStorage()

//init title
let cbTitle = function(evt){
    playlist.title = evt.target.value
    inputFitContent(evt.target)
    onDataChanged(playlist)
}
let label = createLabelDiv("Titre playlist")
let inputTitle = document.createElement("input")
inputTitle.type = "text"
inputTitle.onkeypress = cbTitle
inputTitle.onchange = cbTitle
inputTitle.value = playlist.title
let container = document.getElementById("tracks-title")
container.appendChild(label)
container.appendChild(inputTitle)
inputFitContent(inputTitle)

let onDataChanged = function(playlist){
    saveTolocalStorage(playlist)
    generateDescription(playlist)
}

let addButton = document.getElementById("tracks-add-button")
addButton.classList.add("large-button")
addButton.classList.add("noselect")

addButton.onclick = function(evt){

    //createa a new trackObj
    let previousTrack = null
    if(playlist.tracks.length > 0){
        previousTrack = playlist.tracks[playlist.tracks.length - 1]
    }

    let endPrevious = defaultTime
    if(previousTrack) endPrevious = previousTrack.end

    let trackObj = newTrackObj(playlist.tracks.length + 1, endPrevious, "", "")

    createTrackDiv(playlist, trackObj)

    //register struct
    playlist.tracks.push(trackObj)
    onDataChanged(playlist)
}

let saveButton = document.getElementById("tracks-save")
saveButton.classList.add("noselect")
saveButton.classList.add("small-button")
saveButton.onclick = function(evt){
    let stringData = JSON.stringify(playlist)
    var a = document.createElement("a");
    var file = new Blob([stringData]);
    a.href = URL.createObjectURL(file);
    a.download = "playlist.json";
    a.click();
}

let loadPlaylist = function(playlist){
    //update ui from playlist
    playlist.tracks.forEach(function(track){
        createTrackDiv(playlist, track)
    });

    inputTitle.value = playlist.title
    inputFitContent(inputTitle)

    onDataChanged(playlist)
}

let readSingleFile = function(e) {

    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        playlist = JSON.parse(contents)

        //clean ui
        let list = document.getElementById("tracks-list")
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        loadPlaylist(playlist)
       
    };
    reader.readAsText(file);
}

let fileInput = document.getElementById("tracks-open")
fileInput.addEventListener('change', readSingleFile, false)

let generatePlaylistFromFiles = function(e){
    let files = e.target.files
    if(!files.length) return

    //clean ui
    let list = document.getElementById("tracks-list")
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    playlist.title = ""
    playlist.tracks = []

    for(let i = 0 ; i < files.length; i++){
        let nameFile = files[i].name
        let indexPoint = nameFile.indexOf('.')
        nameFile = nameFile.substring(0, indexPoint != -1 ? indexPoint : nameFile.length)
        //pattern is => index - artist - song title
        array = nameFile.split('-')

        let index = array[0] || i
        let artist = array[1] || ""
        let songTitle = array[2] || ""
        index = index.trim()
        artist = artist.trim()
        songTitle = songTitle.trim()

        let trackObj = newTrackObj(index, defaultTime, artist, songTitle)
        playlist.tracks.push(trackObj)
    }

    loadPlaylist(playlist)
}

let generateDataInputs = document.getElementById("tracks-generate")
generateDataInputs.addEventListener('change', generatePlaylistFromFiles, false)