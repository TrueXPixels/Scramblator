$(function () {

    var socket = io({
        'force new connection': true
    }) // Socket.io | Calling the socket, force new connection is a fallback incase they have two browsers open

    // Functions
    function element(name) {
        return document.getElementById(name)
    }

    // Variables
    var table = element('table')
    var input = element('input-text')
    var count = element('count')
    var counter = 1
    var starting;
    var text
    var valid
    var eng;
    var engValue;

    // Show popup
    $(document).ready(function () {
        $('#modal').modal('show');
    })



    // Add rows
    function addRow(translation, oldText, newText) {

        // Create row
        var row = table.insertRow(1);

        // Create cells
        var cell1 = row.insertCell(-1);
        var cell2 = row.insertCell(-1);
        var cell3 = row.insertCell(-1);
        var cell4 = row.insertCell(-1);

        // Insert data
        cell1.innerHTML = counter;
        cell2.innerHTML = translation;
        cell3.innerHTML = oldText;
        cell4.innerHTML = newText;

        counter++

    }

    $('#input-submit').click(function () {
        text = input.value
        starting = text
        eng = $('#eng').is(':checked'), console.log($('#eng').is(':checked'))
        if (text.trim().length === 0) {
            console.log('You failed to submit any data.')
            valid = false
        } else {
            console.log('You submitted: ' + text)
            valid = true

            if (eng) engValue = 1
            if (text.length > 5000) {
                console.log('The text has reached the max limit of 5000 characters. Sorry!')
                $('#response').after(
                    '<div class="alert alert-danger">' +
                    'The text has reached the max limit of 5000 characters. Sorry!' +
                    '</div>');
            }

            socket.emit('scramble', {
                "text": text,
                "eng": false
            }) // This is emiting something to server.js with the ID of 'scramble'

            socket.on('output', function (data) { // This is recieving something from server.js with the ID of 'output'
                if (data.from === undefined) data.from = 'Chinese Traditional'
                if (valid) addRow(`${data.from} → ${data.to}`, data.old, data.new)
                else if (data.to === 'English') addRow(`<i>${counter}x → ${data.to}</i>`, starting, data.new)

                text = data.new
                if (valid) {
                  
                    if (text.length > 5000) {
                        console.log('The text has reached the max limit of 5000 characters. Sorry!')
                        $('#response').after(
                            '<div class="alert alert-danger">' +
                            'The text has reached the max limit of 5000 characters. Sorry!' +
                            '</div>');
                    }
                  
                    if (engValue === 1) {
                        engValue = 2
                        socket.emit('scramble', {
                            "text": data.new,
                            "eng": true
                        }) // This is emiting something to server.js with the ID of 'scramble'
                    } else if (engValue === 2) {
                        engValue = 1
                        socket.emit('scramble', {
                            "text": data.new,
                            "eng": false
                        }) // This is emiting something to server.js with the ID of 'scramble'
                    } else {
                        socket.emit('scramble', {
                            "text": data.new,
                            "eng": false
                        }) // This is emiting something to server.js with the ID of 'scramble'
                    }
                }
            })

        }

    });

    $('#complete').click(function () {
        console.log('Turning off...')
        valid = false
        if (text.trim().length === 0) return console.log('You didn\'t enter anything!')
        socket.emit('scramble', {
            "text": text,
            "eng": true
        }) // This is emiting something to server.js with the ID of 'scramble'

    })

    socket.on('count', function (data) {
        count.innerHTML = `${data} translations and counting!`
    })

})
