document.addEventListener('DOMContentLoaded', () => {
    // Add scroll-to-top functionality
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Tab switching
    const radioInputs = document.querySelectorAll('.radio-input');
    const tabContents = document.querySelectorAll('.tab-content');

    radioInputs.forEach(input => {
        input.addEventListener('change', () => {
            tabContents.forEach(t => t.classList.remove('active'));
            document.querySelector(`#${input.dataset.tab}`).classList.add('active');
        });
    });

    // Tasks functionality
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <span><i class="fas fa-check-circle"></i> ${task}</span>
                <button onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
            `;
            taskList.appendChild(li);
        });
    }

    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };

    addTaskBtn.addEventListener('click', () => {
        const task = taskInput.value.trim();
        if (task) {
            tasks.push(task);
            saveTasks();
            renderTasks();
            taskInput.value = '';
        }
    });

    // Notes functionality
    const notesArea = document.getElementById('notesArea');
    const saveNotesBtn = document.getElementById('saveNotesBtn');

    notesArea.value = localStorage.getItem('notes') || '';

    saveNotesBtn.addEventListener('click', () => {
        localStorage.setItem('notes', notesArea.value);
        alert('Notes saved!');
    });

    // Schedule functionality
    const scheduleDate = document.getElementById('scheduleDate');
    const addScheduleBtn = document.getElementById('addScheduleBtn');
    const scheduleList = document.getElementById('scheduleList');
    
    let schedules = JSON.parse(localStorage.getItem('schedules')) || {};
    
    // Set default date to today
    scheduleDate.valueAsDate = new Date();
    
    function saveSchedules() {
        localStorage.setItem('schedules', JSON.stringify(schedules));
    }
    
    function renderSchedules() {
        const date = scheduleDate.value;
        const daySchedules = schedules[date] || [];
        
        scheduleList.innerHTML = `
            <div class="schedule-date">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            ${daySchedules.map((schedule, index) => `
                <div class="schedule-item">
                    <div class="schedule-content" contenteditable="true" onblur="updateSchedule(event, '${date}', ${index})">${schedule.content}</div>
                    <button onclick="deleteSchedule('${date}', ${index})" class="delete-schedule">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        `;
    }
    
    window.updateSchedule = (event, date, index) => {
        schedules[date][index].content = event.target.textContent;
        saveSchedules();
    };
    
    addScheduleBtn.addEventListener('click', () => {
        const date = scheduleDate.value;
        if (!schedules[date]) schedules[date] = [];
        
        schedules[date].push({
            content: 'Click to edit schedule...'
        });
        saveSchedules();
        renderSchedules();
    });
    
    scheduleDate.addEventListener('change', renderSchedules);
    
    // PDF Notes Functionality
    const pdfFile = document.getElementById('pdfFile');
    const pdfList = document.getElementById('pdfList');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');
    const currentPdfName = document.getElementById('currentPdfName');
    const closePdf = document.getElementById('closePdf');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const notesTabs = document.querySelectorAll('.tab-btn');

    let currentZoom = 100;
    let savedPdfs = JSON.parse(localStorage.getItem('savedPdfs')) || [];

    // Switch between text and PDF notes
    notesTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            notesTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('textNotes').classList.toggle('active', tab.dataset.notes === 'text');
            document.getElementById('pdfNotes').classList.toggle('active', tab.dataset.notes === 'pdf');
        });
    });

    // Handle PDF file upload
    pdfFile.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        
        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const pdfData = {
                    name: file.name,
                    data: e.target.result,
                    date: new Date().toLocaleString()
                };
                savedPdfs.push(pdfData);
                localStorage.setItem('savedPdfs', JSON.stringify(savedPdfs));
                renderPdfList();
            };
            reader.readAsDataURL(file);
        }
    });

    // Render PDF list
    function renderPdfList() {
        pdfList.innerHTML = savedPdfs.map((pdf, index) => `
            <div class="pdf-item" onclick="openPdf(${index})">
                <i class="fas fa-file-pdf"></i>
                <p>${pdf.name}</p>
                <small>${pdf.date}</small>
                <button onclick="deletePdf(event, ${index})" class="delete-pdf">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // Open PDF viewer
    window.openPdf = (index) => {
        const pdf = savedPdfs[index];
        currentPdfName.textContent = pdf.name;
        pdfFrame.src = pdf.data;
        pdfViewer.classList.add('active');
        currentZoom = 100;
        pdfFrame.style.transform = `scale(1)`;
    };

    // Delete PDF
    window.deletePdf = (event, index) => {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this PDF?')) {
            savedPdfs.splice(index, 1);
            localStorage.setItem('savedPdfs', JSON.stringify(savedPdfs));
            renderPdfList();
        }
    };

    // PDF viewer controls
    closePdf.addEventListener('click', () => {
        pdfViewer.classList.remove('active');
        pdfFrame.src = '';
    });

    zoomIn.addEventListener('click', () => {
        currentZoom += 10;
        pdfFrame.style.transform = `scale(${currentZoom / 100})`;
    });

    zoomOut.addEventListener('click', () => {
        currentZoom = Math.max(50, currentZoom - 10);
        pdfFrame.style.transform = `scale(${currentZoom / 100})`;
    });

    // Music Player functionality
    const musicFile = document.getElementById('musicFile');
    const audioPlayer = document.getElementById('audioPlayer');
    const playlist = document.getElementById('playlist');
    const playPause = document.getElementById('playPause');
    const prevTrack = document.getElementById('prevTrack');
    const nextTrack = document.getElementById('nextTrack');
    const volumeSlider = document.getElementById('volumeSlider');
    const nowPlaying = document.getElementById('nowPlaying');

    let tracks = [];
    let currentTrack = 0;

    musicFile.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        tracks = tracks.concat(files);
        renderPlaylist();
    });

    function renderPlaylist() {
        playlist.innerHTML = tracks.map((track, index) => `
            <div class="track-item ${index === currentTrack ? 'playing' : ''}" onclick="playTrack(${index})">
                <i class="fas ${index === currentTrack ? 'fa-volume-up' : 'fa-music'}"></i>
                <span>${track.name}</span>
                <button onclick="deleteTrack(event, ${index})" class="delete-track">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    window.deleteTrack = (event, index) => {
        event.stopPropagation(); // Prevent track from playing when deleting
        if (confirm('Are you sure you want to delete this track?')) {
            if (index === currentTrack) {
                audioPlayer.pause();
                audioPlayer.src = '';
                playPause.innerHTML = '<i class="fas fa-play"></i>';
                nowPlaying.textContent = 'No track selected';
            }
            tracks.splice(index, 1);
            if (index < currentTrack) currentTrack--;
            renderPlaylist();
        }
    };

    window.playTrack = (index) => {
        currentTrack = index;
        const track = tracks[currentTrack];
        audioPlayer.src = URL.createObjectURL(track);
        audioPlayer.play();
        playPause.innerHTML = '<i class="fas fa-pause"></i>';
        nowPlaying.textContent = track.name;
        renderPlaylist();
    };

    playPause.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPause.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPause.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    prevTrack.addEventListener('click', () => {
        if (currentTrack > 0) {
            playTrack(currentTrack - 1);
        }
    });

    nextTrack.addEventListener('click', () => {
        if (currentTrack < tracks.length - 1) {
            playTrack(currentTrack + 1);
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });

    audioPlayer.addEventListener('ended', () => {
        if (currentTrack < tracks.length - 1) {
            playTrack(currentTrack + 1);
        } else {
            playPause.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // Initial render
    renderTasks();
    renderPdfList();
    renderSchedules();
});
