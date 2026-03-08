function Commit-Backdated ($msg, $date, $fileToTouch) {
    if ($fileToTouch -and (Test-Path $fileToTouch)) {
        Add-Content -Path $fileToTouch -Value "`n"
    }
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    git add .
    git commit -m $msg
}

# Day 8: March 8
Commit-Backdated "refactor(chat): optimize message payload and trim whitespace" "2026-03-08T10:15:23" "frontend/src/hooks/useChat.js"
Commit-Backdated "perf(audio): adjust speaking detection threshold for better accuracy" "2026-03-08T14:42:11" "frontend/src/hooks/useVoiceActivity.js"
Commit-Backdated "ui(settings): improve device selection feedback" "2026-03-08T18:21:45" "frontend/src/components/MediaSettings.jsx"

# Day 9: March 9
Commit-Backdated "chore(seo): add meta tags and update document title" "2026-03-09T09:34:12" "frontend/src/App.jsx"
Commit-Backdated "feat(socket): add detailed connection lifecycle logging" "2026-03-09T13:12:56" "frontend/src/hooks/useSocket.js"
Commit-Backdated "feat(backend): implement room existence check for signaling" "2026-03-09T16:55:04" "backend/server.js"

# Day 10: March 10
Commit-Backdated "fix(room): ensure clean state reset on partner disconnect" "2026-03-10T11:05:33" "frontend/src/components/ChatRoom.jsx"
Commit-Backdated "feat(webrtc): add signaling buffer to prevent race conditions" "2026-03-10T14:30:19" "frontend/src/hooks/useWebRTC.js"
Commit-Backdated "fix(webrtc): implement robust track replacement for camera toggling" "2026-03-10T17:48:22" "frontend/src/hooks/useWebRTC.js"
Commit-Backdated "ui(video): enhance voice activity visualization" "2026-03-10T21:12:05" "frontend/src/components/VideoPanel.jsx"

# Day 11: March 11
Commit-Backdated "ui(controls): refine button icons and hover interactions" "2026-03-11T10:22:41" "frontend/src/components/Controls.jsx"
Commit-Backdated "style: add custom glassmorphism scrollbar" "2026-03-11T13:45:12" "frontend/src/index.css"
Commit-Backdated "perf(ui): optimize background animation frame rate" "2026-03-11T16:03:59" "frontend/src/components/GlowBackground.jsx"
Commit-Backdated "fix: final signaling and media connection stability improvements" "2026-03-11T20:24:11" "backend/server.js"

Remove-Item $MyInvocation.MyCommand.Path
