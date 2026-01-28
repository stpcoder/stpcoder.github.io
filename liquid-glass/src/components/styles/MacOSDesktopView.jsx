import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import resumeData from '../../data/resume-data.json'
import StyleSwitcher from '../StyleSwitcher'

const getText = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.en || obj.ko || ''
}

// 데스크탑 아이콘 - 화면 전체에 자연스럽게 분포
const DESKTOP_ICONS = [
  { id: 'about', name: 'About Me', icon: 'textedit', type: 'txt', x: 15, y: 60 },
  { id: 'education', name: 'Education', icon: 'preview', type: 'pdf', x: 55, y: 80 },
  { id: 'experience', name: 'Experience', icon: 'app', type: 'app', x: 35, y: 200 },
  { id: 'projects', name: 'Projects', icon: 'folder', type: 'folder', x: 70, y: 160 },
  { id: 'awards', name: 'Awards', icon: 'preview', type: 'pdf', x: 25, y: 340 },
  { id: 'contact', name: 'Contact', icon: 'contacts', type: 'app', x: 60, y: 300 }
]

// Dock 아이템
const DOCK_APPS = [
  { id: 'finder', name: 'Finder', icon: 'finder', action: 'finder' },
  { id: 'launchpad', name: 'Launchpad', icon: 'launchpad', action: 'launchpad' },
  { id: 'safari', name: 'Safari', icon: 'safari', action: 'safari' },
  { id: 'messages', name: 'Messages', icon: 'messages', action: 'messages' },
  { id: 'mail', name: 'Mail', icon: 'mail', action: 'mail' },
  { id: 'photos', name: 'Photos', icon: 'photos', action: 'photos' },
  { id: 'music', name: 'Music', icon: 'music', action: 'music' },
  { id: 'notes', name: 'Notes', icon: 'notes', action: 'notes' },
  { id: 'settings', name: 'System Settings', icon: 'settings', action: 'settings' },
]

// 메뉴바 메뉴 정의
const MENUS = {
  apple: {
    label: '',
    items: [
      { label: 'About This Mac', action: 'aboutMac' },
      { type: 'separator' },
      { label: 'System Settings...', action: 'settings', shortcut: '⌘,' },
      { label: 'App Store...', action: 'appstore' },
      { type: 'separator' },
      { label: 'Recent Items', submenu: [
        { label: 'Applications', submenu: [
          { label: 'Safari' },
          { label: 'Finder' },
          { label: 'Notes' },
        ]},
        { label: 'Documents', submenu: [
          { label: 'Resume.pdf' },
          { label: 'About Me.txt' },
        ]},
        { type: 'separator' },
        { label: 'Clear Menu' },
      ]},
      { type: 'separator' },
      { label: 'Force Quit...', shortcut: '⌥⌘⎋' },
      { type: 'separator' },
      { label: 'Sleep' },
      { label: 'Restart...' },
      { label: 'Shut Down...' },
      { type: 'separator' },
      { label: 'Lock Screen', shortcut: '⌃⌘Q' },
      { label: 'Log Out Taeho Je...', shortcut: '⇧⌘Q' },
    ]
  },
  finder: {
    label: 'Finder',
    items: [
      { label: 'About Finder' },
      { type: 'separator' },
      { label: 'Settings...', shortcut: '⌘,' },
      { type: 'separator' },
      { label: 'Empty Trash...', shortcut: '⇧⌘⌫' },
      { type: 'separator' },
      { label: 'Services', submenu: [
        { label: 'No Services Apply' },
      ]},
      { type: 'separator' },
      { label: 'Hide Finder', shortcut: '⌘H' },
      { label: 'Hide Others', shortcut: '⌥⌘H' },
      { label: 'Show All' },
    ]
  },
  file: {
    label: 'File',
    items: [
      { label: 'New Finder Window', shortcut: '⌘N' },
      { label: 'New Folder', shortcut: '⇧⌘N' },
      { label: 'New Folder with Selection', shortcut: '⌃⌘N' },
      { label: 'New Smart Folder' },
      { label: 'New Tab', shortcut: '⌘T' },
      { type: 'separator' },
      { label: 'Open', shortcut: '⌘O' },
      { label: 'Open With', submenu: [
        { label: 'Preview' },
        { label: 'TextEdit' },
        { label: 'Other...' },
      ]},
      { label: 'Close Window', shortcut: '⌘W' },
      { type: 'separator' },
      { label: 'Get Info', shortcut: '⌘I' },
      { label: 'Rename' },
      { label: 'Compress' },
      { label: 'Duplicate', shortcut: '⌘D' },
      { label: 'Make Alias', shortcut: '⌃⌘A' },
      { label: 'Quick Look', shortcut: '⌘Y' },
      { type: 'separator' },
      { label: 'Move to Trash', shortcut: '⌘⌫' },
      { label: 'Eject' },
      { type: 'separator' },
      { label: 'Find', shortcut: '⌘F' },
    ]
  },
  edit: {
    label: 'Edit',
    items: [
      { label: 'Undo', shortcut: '⌘Z', disabled: true },
      { label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
      { type: 'separator' },
      { label: 'Cut', shortcut: '⌘X', disabled: true },
      { label: 'Copy', shortcut: '⌘C', disabled: true },
      { label: 'Paste', shortcut: '⌘V', disabled: true },
      { label: 'Select All', shortcut: '⌘A' },
      { type: 'separator' },
      { label: 'Show Clipboard' },
      { type: 'separator' },
      { label: 'Start Dictation...', shortcut: '🎤🎤' },
      { label: 'Emoji & Symbols', shortcut: '⌃⌘Space' },
    ]
  },
  view: {
    label: 'View',
    items: [
      { label: 'as Icons', shortcut: '⌘1', checked: true },
      { label: 'as List', shortcut: '⌘2' },
      { label: 'as Columns', shortcut: '⌘3' },
      { label: 'as Gallery', shortcut: '⌘4' },
      { type: 'separator' },
      { label: 'Use Stacks', shortcut: '⌃⌘0' },
      { label: 'Sort By', submenu: [
        { label: 'None', checked: true },
        { label: 'Snap to Grid' },
        { type: 'separator' },
        { label: 'Name' },
        { label: 'Kind' },
        { label: 'Date Last Opened' },
        { label: 'Date Added' },
        { label: 'Date Modified' },
        { label: 'Date Created' },
        { label: 'Size' },
        { label: 'Tags' },
      ]},
      { label: 'Clean Up' },
      { label: 'Clean Up By', submenu: [
        { label: 'Name' },
        { label: 'Kind' },
        { label: 'Date Last Opened' },
        { label: 'Date Added' },
        { label: 'Date Modified' },
        { label: 'Size' },
        { label: 'Tags' },
      ]},
      { type: 'separator' },
      { label: 'Show Tab Bar' },
      { label: 'Show All Tabs' },
      { label: 'Hide Sidebar', shortcut: '⌥⌘S' },
      { label: 'Show Preview', shortcut: '⇧⌘P' },
      { type: 'separator' },
      { label: 'Hide Toolbar', shortcut: '⌥⌘T' },
      { label: 'Show Path Bar', shortcut: '⌥⌘P' },
      { label: 'Show Status Bar' },
      { type: 'separator' },
      { label: 'Enter Full Screen', shortcut: '⌃⌘F' },
    ]
  },
  go: {
    label: 'Go',
    items: [
      { label: 'Back', shortcut: '⌘[' },
      { label: 'Forward', shortcut: '⌘]' },
      { label: 'Enclosing Folder', shortcut: '⌘↑' },
      { type: 'separator' },
      { label: 'Recents', shortcut: '⇧⌘F' },
      { label: 'Documents', shortcut: '⇧⌘O' },
      { label: 'Desktop', shortcut: '⇧⌘D' },
      { label: 'Downloads', shortcut: '⌥⌘L' },
      { label: 'Home', shortcut: '⇧⌘H' },
      { label: 'Computer', shortcut: '⇧⌘C' },
      { label: 'AirDrop', shortcut: '⇧⌘R' },
      { label: 'Network', shortcut: '⇧⌘K' },
      { label: 'iCloud Drive' },
      { label: 'Applications', shortcut: '⇧⌘A' },
      { label: 'Utilities', shortcut: '⇧⌘U' },
      { type: 'separator' },
      { label: 'Recent Folders', submenu: [
        { label: 'Projects' },
        { label: 'Documents' },
        { label: 'Downloads' },
      ]},
      { type: 'separator' },
      { label: 'Go to Folder...', shortcut: '⇧⌘G' },
      { label: 'Connect to Server...', shortcut: '⌘K' },
    ]
  },
  window: {
    label: 'Window',
    items: [
      { label: 'Minimize', shortcut: '⌘M' },
      { label: 'Zoom' },
      { label: 'Fill' },
      { label: 'Center' },
      { type: 'separator' },
      { label: 'Move & Resize', submenu: [
        { label: 'Left' },
        { label: 'Right' },
        { label: 'Top' },
        { label: 'Bottom' },
        { type: 'separator' },
        { label: 'Top Left' },
        { label: 'Top Right' },
        { label: 'Bottom Left' },
        { label: 'Bottom Right' },
      ]},
      { type: 'separator' },
      { label: 'Cycle Through Windows', shortcut: '⌘`' },
      { type: 'separator' },
      { label: 'Bring All to Front' },
    ]
  },
  help: {
    label: 'Help',
    items: [
      { label: 'Search', isSearch: true },
      { type: 'separator' },
      { label: 'macOS Help' },
      { label: 'See What\'s New in macOS' },
      { label: 'New to Mac? Tour the Basics' },
    ]
  }
}

// 시간 포맷
const getTime = () => {
  const now = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}  ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// macOS Tahoe (2026) 스타일 아이콘 - Liquid Glass 디자인
// 실제 macOS 아이콘 비율과 디자인을 정확하게 반영
function AppIcon({ type, size = 64 }) {
  const uid = `${type}-${size}-${Math.random().toString(36).substr(2, 9)}`

  const icons = {
    // TextEdit - 노트패드 + 연필 아이콘
    textedit: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`textedit-paper-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffef5"/>
            <stop offset="100%" stopColor="#f5f4e8"/>
          </linearGradient>
          <linearGradient id={`textedit-pencil-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffdc00"/>
            <stop offset="100%" stopColor="#f5a623"/>
          </linearGradient>
        </defs>
        {/* 종이 뒷면 그림자 */}
        <rect x="10" y="8" width="44" height="52" rx="3" fill="#d4d4d4"/>
        {/* 노란 노트패드 상단 */}
        <rect x="8" y="6" width="44" height="52" rx="3" fill={`url(#textedit-paper-${uid})`}/>
        <rect x="8" y="6" width="44" height="52" rx="3" fill="none" stroke="#c7c7c7" strokeWidth="0.5"/>
        {/* 노란색 상단 바 */}
        <rect x="8" y="6" width="44" height="8" rx="3" fill="#ffd60a"/>
        <rect x="8" y="10" width="44" height="4" fill="#ffd60a"/>
        {/* 텍스트 라인 */}
        <rect x="14" y="20" width="32" height="2" rx="1" fill="#1d1d1f"/>
        <rect x="14" y="26" width="28" height="1.5" rx="0.75" fill="#86868b"/>
        <rect x="14" y="32" width="30" height="1.5" rx="0.75" fill="#86868b"/>
        <rect x="14" y="38" width="24" height="1.5" rx="0.75" fill="#86868b"/>
        <rect x="14" y="44" width="27" height="1.5" rx="0.75" fill="#86868b"/>
        {/* 연필 */}
        <g transform="rotate(-45, 50, 52)">
          <rect x="44" y="42" width="14" height="5" rx="1" fill={`url(#textedit-pencil-${uid})`}/>
          <polygon points="44,42 44,47 40,44.5" fill="#f5d6ba"/>
          <rect x="56" y="42" width="3" height="5" rx="0.5" fill="#ff6b6b"/>
          <rect x="58" y="42" width="1" height="5" fill="#c44"/>
        </g>
      </svg>
    ),
    // Preview - 사진/렌즈 아이콘 (linen tester 스타일)
    preview: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`preview-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5ac8fa"/>
            <stop offset="100%" stopColor="#007aff"/>
          </linearGradient>
          <linearGradient id={`preview-photo-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#87ceeb"/>
            <stop offset="60%" stopColor="#98d8c8"/>
            <stop offset="100%" stopColor="#7eb77f"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#preview-bg-${uid})`}/>
        {/* 사진 프레임 */}
        <rect x="10" y="12" width="44" height="34" rx="3" fill="#fff"/>
        <rect x="13" y="15" width="38" height="28" rx="2" fill={`url(#preview-photo-${uid})`}/>
        {/* 사진 내 풍경 */}
        <circle cx="22" cy="22" r="4" fill="#ffd60a"/>
        <path d="M13 43 L26 28 L35 37 L43 30 L51 43 Z" fill="#4ade80"/>
        <path d="M30 43 L38 33 L51 43 Z" fill="#22c55e"/>
        {/* 돋보기/렌즈 */}
        <g>
          <circle cx="42" cy="46" r="10" fill="rgba(30,30,30,0.9)" stroke="#1a1a1a" strokeWidth="2"/>
          <circle cx="42" cy="46" r="7" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
          <ellipse cx="39" cy="43" rx="2" ry="1.5" fill="rgba(255,255,255,0.4)"/>
        </g>
      </svg>
    ),
    // Folder - macOS 파란색 폴더
    folder: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`folder-back-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc"/>
            <stop offset="100%" stopColor="#38bdf8"/>
          </linearGradient>
          <linearGradient id={`folder-front-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8"/>
            <stop offset="100%" stopColor="#0284c7"/>
          </linearGradient>
          <linearGradient id={`folder-shine-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        {/* 폴더 뒷면 탭 */}
        <path d="M4 18 L4 12 Q4 8 8 8 L22 8 Q24 8 25 10 L28 16 L56 16 Q60 16 60 20 L60 22 L4 22 Z" fill={`url(#folder-back-${uid})`}/>
        {/* 폴더 앞면 */}
        <rect x="4" y="20" width="56" height="38" rx="5" fill={`url(#folder-front-${uid})`}/>
        {/* 상단 광택 */}
        <rect x="4" y="20" width="56" height="15" rx="5" fill={`url(#folder-shine-${uid})`}/>
        {/* 테두리 */}
        <rect x="4" y="20" width="56" height="38" rx="5" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>
      </svg>
    ),
    // App - 일반 앱 아이콘 (보라색 그라데이션)
    app: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`app-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
          <linearGradient id={`app-shine-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)"/>
            <stop offset="50%" stopColor="rgba(255,255,255,0.1)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#app-bg-${uid})`}/>
        <rect x="4" y="4" width="56" height="30" rx="13" fill={`url(#app-shine-${uid})`}/>
        {/* 사람 아이콘 */}
        <circle cx="32" cy="24" r="10" fill="rgba(255,255,255,0.95)"/>
        <path d="M18 50 Q18 38 32 38 Q46 38 46 50" fill="rgba(255,255,255,0.95)"/>
      </svg>
    ),
    // Contacts - 갈색 주소록
    contacts: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`contacts-cover-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a1887f"/>
            <stop offset="100%" stopColor="#6d4c41"/>
          </linearGradient>
          <linearGradient id={`contacts-spine-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5d4037"/>
            <stop offset="50%" stopColor="#4e342e"/>
            <stop offset="100%" stopColor="#5d4037"/>
          </linearGradient>
        </defs>
        {/* 책 표지 */}
        <rect x="8" y="6" width="48" height="52" rx="4" fill={`url(#contacts-cover-${uid})`}/>
        {/* 책등 */}
        <rect x="8" y="6" width="8" height="52" rx="2" fill={`url(#contacts-spine-${uid})`}/>
        {/* 페이지들 */}
        <rect x="16" y="8" width="38" height="48" rx="2" fill="#fff"/>
        <rect x="18" y="10" width="34" height="44" rx="1" fill="#fafafa"/>
        {/* 연락처 실루엣 */}
        <circle cx="35" cy="26" r="10" fill="#e0e0e0"/>
        <ellipse cx="35" cy="46" rx="14" ry="9" fill="#e0e0e0"/>
        {/* 빨간 책갈피 */}
        <path d="M12 6 L12 22 L15 18 L18 22 L18 6 Z" fill="#ef4444"/>
      </svg>
    ),
    // Finder - 전통적인 50/50 투톤 얼굴 (왼쪽 진한 파랑, 오른쪽 밝은 색)
    finder: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`finder-left-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5ac8fa"/>
            <stop offset="100%" stopColor="#007aff"/>
          </linearGradient>
          <linearGradient id={`finder-right-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8f4fc"/>
            <stop offset="100%" stopColor="#b8d4e8"/>
          </linearGradient>
          <clipPath id={`finder-left-clip-${uid}`}>
            <rect x="4" y="4" width="28" height="56"/>
          </clipPath>
          <clipPath id={`finder-right-clip-${uid}`}>
            <rect x="32" y="4" width="28" height="56"/>
          </clipPath>
        </defs>
        {/* 배경 - squircle */}
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#finder-left-${uid})`}/>
        {/* 왼쪽 반 - 진한 파랑 */}
        <g clipPath={`url(#finder-left-clip-${uid})`}>
          <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#finder-left-${uid})`}/>
          {/* 왼쪽 얼굴 반 */}
          <ellipse cx="32" cy="34" rx="20" ry="22" fill="#fff"/>
        </g>
        {/* 오른쪽 반 - 밝은 색 */}
        <g clipPath={`url(#finder-right-clip-${uid})`}>
          <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#finder-right-${uid})`}/>
          {/* 오른쪽 얼굴 반 */}
          <ellipse cx="32" cy="34" rx="20" ry="22" fill="#fff"/>
        </g>
        {/* 얼굴 요소들 */}
        {/* 눈 */}
        <ellipse cx="24" cy="30" rx="4" ry="5" fill="#007aff"/>
        <ellipse cx="40" cy="30" rx="4" ry="5" fill="#007aff"/>
        {/* 눈썹 */}
        <path d="M18 22 L14 16" stroke="#007aff" strokeWidth="3" strokeLinecap="round"/>
        <path d="M46 22 L50 16" stroke="#007aff" strokeWidth="3" strokeLinecap="round"/>
        {/* 미소 */}
        <path d="M22 44 Q32 54 42 44" stroke="#007aff" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        {/* 코 라인 (가운데 구분) */}
        <line x1="32" y1="28" x2="32" y2="40" stroke="rgba(0,122,255,0.3)" strokeWidth="1"/>
      </svg>
    ),
    // Launchpad - 로켓/그리드 아이콘
    launchpad: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`launchpad-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a3a3c"/>
            <stop offset="100%" stopColor="#1c1c1e"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#launchpad-bg-${uid})`}/>
        {/* 4x4 앱 그리드 (실제 Launchpad 스타일) */}
        <circle cx="18" cy="18" r="6" fill="#ff9500"/>
        <circle cx="32" cy="18" r="6" fill="#30d158"/>
        <circle cx="46" cy="18" r="6" fill="#5856d6"/>
        <circle cx="18" cy="32" r="6" fill="#ff375f"/>
        <circle cx="32" cy="32" r="6" fill="#0a84ff"/>
        <circle cx="46" cy="32" r="6" fill="#ffcc00"/>
        <circle cx="18" cy="46" r="6" fill="#64d2ff"/>
        <circle cx="32" cy="46" r="6" fill="#bf5af2"/>
        <circle cx="46" cy="46" r="6" fill="#ff6482"/>
      </svg>
    ),
    // Safari - 나침반 아이콘
    safari: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`safari-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5ac8fa"/>
            <stop offset="100%" stopColor="#007aff"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#safari-bg-${uid})`}/>
        {/* 나침반 배경 */}
        <circle cx="32" cy="32" r="22" fill="#fff"/>
        {/* 외곽 눈금 */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
          <line
            key={i}
            x1={32 + 18 * Math.cos((angle - 90) * Math.PI / 180)}
            y1={32 + 18 * Math.sin((angle - 90) * Math.PI / 180)}
            x2={32 + 21 * Math.cos((angle - 90) * Math.PI / 180)}
            y2={32 + 21 * Math.sin((angle - 90) * Math.PI / 180)}
            stroke="#333"
            strokeWidth={angle % 90 === 0 ? 2 : 1}
          />
        ))}
        {/* 나침반 바늘 - 빨간색 (북) */}
        <polygon points="32,12 36,32 32,36 28,32" fill="#ff3b30"/>
        {/* 나침반 바늘 - 흰색 (남) */}
        <polygon points="32,52 36,32 32,28 28,32" fill="#e5e5ea"/>
        {/* 중앙 점 */}
        <circle cx="32" cy="32" r="3" fill="#333"/>
      </svg>
    ),
    // Messages - 초록색 말풍선
    messages: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`messages-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34c759"/>
            <stop offset="100%" stopColor="#248a3d"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#messages-bg-${uid})`}/>
        {/* 말풍선 */}
        <path d="M32 12 C16 12 8 22 8 31 C8 37 11 42 16 45 L12 55 L24 48 C26 48.7 29 49 32 49 C48 49 56 40 56 31 C56 22 48 12 32 12" fill="#fff"/>
      </svg>
    ),
    // Mail - 봉투 아이콘
    mail: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`mail-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5ac8fa"/>
            <stop offset="100%" stopColor="#007aff"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#mail-bg-${uid})`}/>
        {/* 봉투 */}
        <rect x="8" y="16" width="48" height="32" rx="3" fill="#fff"/>
        {/* 봉투 플랩 */}
        <path d="M8 18 L32 38 L56 18" stroke="#007aff" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        {/* 하단 접힌 부분 */}
        <path d="M8 48 L26 34" stroke="#ddd" strokeWidth="1" fill="none"/>
        <path d="M56 48 L38 34" stroke="#ddd" strokeWidth="1" fill="none"/>
      </svg>
    ),
    // Photos - 무지개 꽃 아이콘
    photos: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`photos-bg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9500"/>
            <stop offset="25%" stopColor="#ff3b30"/>
            <stop offset="50%" stopColor="#af52de"/>
            <stop offset="75%" stopColor="#5856d6"/>
            <stop offset="100%" stopColor="#007aff"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#photos-bg-${uid})`}/>
        {/* 꽃잎 8개 */}
        <ellipse cx="32" cy="18" rx="7" ry="12" fill="rgba(255,255,255,0.95)"/>
        <ellipse cx="42" cy="22" rx="7" ry="12" fill="rgba(255,255,255,0.95)" transform="rotate(45 42 22)"/>
        <ellipse cx="46" cy="32" rx="12" ry="7" fill="rgba(255,255,255,0.95)"/>
        <ellipse cx="42" cy="42" rx="7" ry="12" fill="rgba(255,255,255,0.95)" transform="rotate(-45 42 42)"/>
        <ellipse cx="32" cy="46" rx="7" ry="12" fill="rgba(255,255,255,0.95)"/>
        <ellipse cx="22" cy="42" rx="7" ry="12" fill="rgba(255,255,255,0.95)" transform="rotate(45 22 42)"/>
        <ellipse cx="18" cy="32" rx="12" ry="7" fill="rgba(255,255,255,0.95)"/>
        <ellipse cx="22" cy="22" rx="7" ry="12" fill="rgba(255,255,255,0.95)" transform="rotate(-45 22 22)"/>
        {/* 중앙 */}
        <circle cx="32" cy="32" r="7" fill="#ffd60a"/>
      </svg>
    ),
    // Music - 음표 아이콘
    music: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`music-bg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fc3c44"/>
            <stop offset="100%" stopColor="#ff2d55"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#music-bg-${uid})`}/>
        {/* 음표 */}
        <circle cx="20" cy="44" r="8" fill="#fff"/>
        <circle cx="20" cy="44" r="3" fill="#fc3c44"/>
        <rect x="26" y="14" width="4" height="30" rx="2" fill="#fff"/>
        <path d="M26 14 Q38 10 48 8 L48 24 Q38 28 26 30" fill="#fff"/>
        {/* 음표 하이라이트 */}
        <ellipse cx="18" cy="42" rx="2" ry="1.5" fill="rgba(255,255,255,0.5)"/>
      </svg>
    ),
    // Notes - 노란 노트 아이콘
    notes: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`notes-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffcc00"/>
            <stop offset="100%" stopColor="#ff9500"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#notes-bg-${uid})`}/>
        {/* 노트 종이 */}
        <rect x="10" y="10" width="44" height="44" rx="5" fill="#fff"/>
        {/* 노란 헤더 */}
        <rect x="10" y="10" width="44" height="10" rx="5" fill="#ffd60a"/>
        <rect x="10" y="15" width="44" height="5" fill="#ffd60a"/>
        {/* 텍스트 라인 */}
        <rect x="16" y="26" width="28" height="2" rx="1" fill="#1d1d1f"/>
        <rect x="16" y="32" width="24" height="1.5" rx="0.75" fill="#c7c7cc"/>
        <rect x="16" y="38" width="26" height="1.5" rx="0.75" fill="#c7c7cc"/>
        <rect x="16" y="44" width="20" height="1.5" rx="0.75" fill="#c7c7cc"/>
      </svg>
    ),
    // Settings - 톱니바퀴 아이콘
    settings: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`settings-bg-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8e8e93"/>
            <stop offset="100%" stopColor="#636366"/>
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="13" fill={`url(#settings-bg-${uid})`}/>
        {/* 톱니바퀴 */}
        <g fill="#fff">
          {/* 중앙 원 */}
          <circle cx="32" cy="32" r="10" fill="none" stroke="#fff" strokeWidth="6"/>
          <circle cx="32" cy="32" r="5" fill="#fff"/>
          {/* 톱니 8개 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <rect
              key={i}
              x="29"
              y="6"
              width="6"
              height="14"
              rx="3"
              fill="#fff"
              transform={`rotate(${angle} 32 32)`}
            />
          ))}
        </g>
      </svg>
    ),
    // Trash - 휴지통 아이콘
    trash: (
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          <linearGradient id={`trash-body-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e5e5ea"/>
            <stop offset="100%" stopColor="#c7c7cc"/>
          </linearGradient>
          <linearGradient id={`trash-lid-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d1d1d6"/>
            <stop offset="100%" stopColor="#aeaeb2"/>
          </linearGradient>
        </defs>
        {/* 휴지통 몸체 */}
        <path d="M16 22 L19 54 Q19 58 23 58 L41 58 Q45 58 45 54 L48 22" fill={`url(#trash-body-${uid})`}/>
        {/* 뚜껑 */}
        <rect x="12" y="16" width="40" height="6" rx="3" fill={`url(#trash-lid-${uid})`}/>
        <rect x="24" y="10" width="16" height="8" rx="3" fill={`url(#trash-lid-${uid})`}/>
        {/* 세로 라인 */}
        <line x1="24" y1="28" x2="25" y2="50" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="32" y1="28" x2="32" y2="50" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="28" x2="39" y2="50" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round"/>
        {/* 하이라이트 */}
        <path d="M16 22 L19 38 L45 38 L48 22" fill="rgba(255,255,255,0.3)"/>
      </svg>
    )
  }
  return icons[type] || icons.app
}

// 메뉴 아이템 컴포넌트
function MenuItem({ item, onClose, depth = 0 }) {
  const [showSubmenu, setShowSubmenu] = useState(false)
  const itemRef = useRef(null)

  if (item.type === 'separator') {
    return <div className="macos-menu-separator" />
  }

  if (item.isSearch) {
    return (
      <div className="macos-menu-search">
        <svg width="14" height="14" viewBox="0 0 14 14">
          <circle cx="5.5" cy="5.5" r="4.5" stroke="#888" fill="none"/>
          <line x1="9" y1="9" x2="13" y2="13" stroke="#888"/>
        </svg>
        <input type="text" placeholder="Search" />
      </div>
    )
  }

  return (
    <div
      ref={itemRef}
      className={`macos-menu-item-row ${item.disabled ? 'disabled' : ''} ${item.submenu ? 'has-submenu' : ''}`}
      onMouseEnter={() => item.submenu && setShowSubmenu(true)}
      onMouseLeave={() => item.submenu && setShowSubmenu(false)}
      onClick={() => !item.submenu && !item.disabled && onClose?.()}
    >
      <span className="macos-menu-item-check">{item.checked ? '✓' : ''}</span>
      <span className="macos-menu-item-label">{item.label}</span>
      {item.shortcut && <span className="macos-menu-item-shortcut">{item.shortcut}</span>}
      {item.submenu && <span className="macos-menu-item-arrow">›</span>}

      {item.submenu && showSubmenu && (
        <div className="macos-submenu" style={{ left: '100%', top: '-4px' }}>
          {item.submenu.map((subItem, i) => (
            <MenuItem key={i} item={subItem} onClose={onClose} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// 드롭다운 메뉴 컴포넌트
function DropdownMenu({ menu, onClose }) {
  return (
    <motion.div
      className="macos-dropdown-menu"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.1 }}
    >
      {menu.items.map((item, i) => (
        <MenuItem key={i} item={item} onClose={onClose} />
      ))}
    </motion.div>
  )
}

// 메뉴 바
function MenuBar({ activeApp, openMenu, setOpenMenu, onMenuAction }) {
  const [time, setTime] = useState(getTime())
  const menuBarRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => setTime(getTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [setOpenMenu])

  const handleMenuClick = (menuKey) => {
    if (openMenu === menuKey) {
      setOpenMenu(null)
    } else {
      setOpenMenu(menuKey)
    }
  }

  const handleMenuHover = (menuKey) => {
    if (openMenu !== null) {
      setOpenMenu(menuKey)
    }
  }

  const menuKeys = ['apple', 'finder', 'file', 'edit', 'view', 'go', 'window', 'help']

  return (
    <div className="macos-menubar" ref={menuBarRef}>
      <div className="macos-menubar-left">
        {menuKeys.map(key => {
          const menu = MENUS[key]
          const isApple = key === 'apple'
          const isFinder = key === 'finder'

          return (
            <div key={key} className="macos-menu-trigger-wrapper">
              <span
                className={`macos-menu-trigger ${openMenu === key ? 'active' : ''} ${isApple ? 'apple-logo' : ''} ${isFinder ? 'app-name' : ''}`}
                onClick={() => handleMenuClick(key)}
                onMouseEnter={() => handleMenuHover(key)}
              >
                {isApple ? '' : (isFinder ? (activeApp || 'Finder') : menu.label)}
              </span>
              <AnimatePresence>
                {openMenu === key && (
                  <DropdownMenu menu={menu} onClose={() => setOpenMenu(null)} />
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <div className="macos-menubar-right">
        <span className="macos-menubar-icon" onClick={() => onMenuAction?.('wifi')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
            <path d="M5.5 9.5a3.5 3.5 0 015 0" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M3 7a6 6 0 0110 0" stroke="currentColor" strokeWidth="1.2" fill="none"/>
            <path d="M0.5 4.5a9 9 0 0115 0" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          </svg>
        </span>
        <span className="macos-menubar-icon" onClick={() => onMenuAction?.('battery')}>
          <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor">
            <rect x="1" y="4" width="16" height="9" rx="1.5" stroke="currentColor" strokeWidth="1" fill="none"/>
            <rect x="17" y="6" width="2" height="5" rx="0.5" fill="currentColor"/>
            <rect x="3" y="6" width="10" height="5" rx="0.5" fill="#32d74b"/>
          </svg>
        </span>
        <span className="macos-menubar-icon" onClick={() => onMenuAction?.('controlCenter')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="2" width="5" height="5" rx="1"/>
            <rect x="9" y="2" width="5" height="5" rx="1"/>
            <rect x="2" y="9" width="5" height="5" rx="1"/>
            <rect x="9" y="9" width="5" height="5" rx="1"/>
          </svg>
        </span>
        <span className="macos-menubar-icon spotlight" onClick={() => onMenuAction?.('spotlight')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <line x1="9" y1="9" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </span>
        <span className="macos-menubar-time">{time}</span>
      </div>
    </div>
  )
}

// 데스크탑 아이콘
function DesktopIcon({ icon, selected, onSelect, onOpen, constraintsRef }) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  return (
    <motion.div
      className={`macos-desktop-icon ${selected ? 'selected' : ''}`}
      style={{ left: `${icon.x}%`, top: `${icon.y}px` }}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={constraintsRef}
      onDragStart={() => setIsDragging(true)}
      onDrag={(e, info) => {
        setPosition({ x: info.offset.x, y: info.offset.y })
      }}
      onDragEnd={() => {
        setTimeout(() => setIsDragging(false), 100)
      }}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation()
          onSelect(icon.id)
        }
      }}
      onDoubleClick={() => !isDragging && onOpen(icon.id)}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      <div className="macos-icon-image">
        <AppIcon type={icon.icon} size={64} />
      </div>
      <span className="macos-icon-name">{icon.name}</span>
    </motion.div>
  )
}

// 윈도우 컴포넌트
function Window({ window, isActive, onClose, onMinimize, onFocus, onDragStart }) {
  const [showButtons, setShowButtons] = useState(false)

  const handleMouseDown = (e) => {
    if (e.target.closest('.macos-traffic-lights')) return
    onDragStart(e, window.id)
  }

  return (
    <motion.div
      className={`macos-window ${isActive ? 'active' : ''} ${window.type || 'default'}`}
      style={{
        left: window.x,
        top: window.y,
        width: window.width || 600,
        height: window.height || 400,
        zIndex: window.zIndex
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      onClick={() => onFocus(window.id)}
    >
      <div
        className="macos-window-header"
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setShowButtons(true)}
        onMouseLeave={() => setShowButtons(false)}
      >
        <div className="macos-traffic-lights">
          <button
            className={`macos-traffic-light red ${showButtons ? 'show-icon' : ''}`}
            onClick={(e) => { e.stopPropagation(); onClose(window.id) }}
          >
            <svg width="6" height="6" viewBox="0 0 6 6">
              <path d="M0.5 0.5L5.5 5.5M5.5 0.5L0.5 5.5" stroke="#4c0000" strokeWidth="1.2"/>
            </svg>
          </button>
          <button
            className={`macos-traffic-light yellow ${showButtons ? 'show-icon' : ''}`}
            onClick={(e) => { e.stopPropagation(); onMinimize(window.id) }}
          >
            <svg width="6" height="6" viewBox="0 0 6 6">
              <path d="M0.5 3H5.5" stroke="#995700" strokeWidth="1.5"/>
            </svg>
          </button>
          <button className={`macos-traffic-light green ${showButtons ? 'show-icon' : ''}`}>
            <svg width="6" height="6" viewBox="0 0 6 6">
              <path d="M0.5 1.5L0.5 5.5L4.5 5.5M1.5 4.5L5.5 0.5" stroke="#006500" strokeWidth="1"/>
            </svg>
          </button>
        </div>
        <span className="macos-window-title">{window.title}</span>
        {window.type === 'finder' && (
          <div className="macos-window-toolbar">
            <button className="macos-toolbar-btn">‹</button>
            <button className="macos-toolbar-btn">›</button>
            <div className="macos-toolbar-search">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <circle cx="5" cy="5" r="4" stroke="#888" fill="none"/>
                <line x1="8" y1="8" x2="11" y2="11" stroke="#888"/>
              </svg>
              <span>Search</span>
            </div>
          </div>
        )}
      </div>
      <div className="macos-window-content">
        {window.content}
      </div>
    </motion.div>
  )
}

// 윈도우 콘텐츠 컴포넌트들
function AboutContent() {
  return (
    <div className="macos-text-content">
      <div className="macos-text-header">
        <div className="macos-text-avatar">{getText(resumeData.personal.name).charAt(0)}</div>
        <div className="macos-text-info">
          <h1>{getText(resumeData.personal.name)}</h1>
          <h2>{getText(resumeData.personal.title)}</h2>
          <p className="macos-location">📍 {getText(resumeData.personal.location)}</p>
        </div>
      </div>
      <div className="macos-text-body">
        <p>{getText(resumeData.about)}</p>
      </div>
    </div>
  )
}

function EducationContent() {
  return (
    <div className="macos-pdf-content">
      <div className="macos-pdf-toolbar">
        <span className="macos-pdf-page">Page 1 of 1</span>
        <div className="macos-pdf-zoom">
          <button>−</button><span>100%</span><button>+</button>
        </div>
      </div>
      <div className="macos-pdf-body">
        <div className="macos-pdf-paper">
          <h2>📚 Education</h2>
          {resumeData.education.map((edu, i) => (
            <div key={i} className="macos-edu-item">
              <h3>{getText(edu.institution)}</h3>
              <p className="macos-degree">{getText(edu.degree)}</p>
              <div className="macos-edu-meta">
                <span className="macos-gpa">GPA: {edu.gpa}</span>
                <span className="macos-period">{edu.period}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ExperienceContent() {
  const experiences = resumeData.experience.filter(e => e.featured)
  return (
    <div className="macos-app-content experience">
      <div className="macos-app-sidebar">
        <div className="macos-sidebar-header">Experience</div>
        {experiences.map((exp, i) => (
          <div key={i} className={`macos-sidebar-item ${i === 0 ? 'active' : ''}`}>
            <span className="macos-sidebar-icon">💼</span>
            <span>{typeof exp.company === 'string' ? exp.company : getText(exp.company)}</span>
          </div>
        ))}
      </div>
      <div className="macos-app-main">
        {experiences.map((exp, i) => (
          <div key={i} className="macos-exp-card">
            <div className="macos-exp-header">
              <h3>{typeof exp.company === 'string' ? exp.company : getText(exp.company)}</h3>
              <span className="macos-badge">{exp.period}</span>
            </div>
            <p className="macos-position">{getText(exp.position)}</p>
            <p className="macos-desc">{getText(exp.description)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectsContent() {
  const projects = resumeData.projects.filter(p => p.featured)
  return (
    <div className="macos-finder-content">
      <div className="macos-finder-sidebar">
        <div className="macos-finder-section">
          <span className="macos-finder-section-title">Favorites</span>
          <div className="macos-sidebar-item active"><span className="macos-sidebar-icon">📁</span><span>Projects</span></div>
          <div className="macos-sidebar-item"><span className="macos-sidebar-icon">⭐</span><span>Featured</span></div>
        </div>
        <div className="macos-finder-section">
          <span className="macos-finder-section-title">Tags</span>
          <div className="macos-tag-item"><span className="macos-tag-dot red"></span><span>Important</span></div>
          <div className="macos-tag-item"><span className="macos-tag-dot blue"></span><span>Work</span></div>
        </div>
      </div>
      <div className="macos-finder-main">
        <div className="macos-finder-grid">
          {projects.map((proj, i) => (
            <div key={i} className="macos-finder-item">
              <div className="macos-finder-icon"><AppIcon type="folder" size={48} /></div>
              <div className="macos-finder-info">
                <h4>{proj.link ? <a href={proj.link} target="_blank" rel="noopener noreferrer">{getText(proj.title)}</a> : getText(proj.title)}</h4>
                <p className="macos-finder-meta">{getText(proj.organization)} • {proj.year}</p>
                <p className="macos-finder-desc">{getText(proj.description)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AwardsContent() {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 4

  const allAwards = [
    ...resumeData.awards.flatMap(cat => cat.items.filter(a => a.featured)),
    ...resumeData.scholarships.filter(s => s.featured).map(s => ({ title: s.title, organization: s.organization, year: s.period, isScholarship: true }))
  ]

  const totalPages = Math.ceil(allAwards.length / itemsPerPage)
  const currentAwards = allAwards.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  return (
    <div className="macos-pdf-content">
      <div className="macos-pdf-toolbar">
        <button
          className="macos-pdf-nav"
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >‹</button>
        <span className="macos-pdf-page">Page {currentPage + 1} of {totalPages}</span>
        <button
          className="macos-pdf-nav"
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage === totalPages - 1}
        >›</button>
        <div className="macos-pdf-zoom"><button>−</button><span>100%</span><button>+</button></div>
      </div>
      <div className="macos-pdf-body">
        <div className="macos-pdf-paper">
          <h2>🏆 Awards & Scholarships</h2>
          <div className="macos-awards-grid">
            {currentAwards.map((award, i) => (
              <div key={i} className={`macos-award-card ${award.isScholarship ? 'scholarship' : ''}`}>
                <span className="macos-award-icon">{award.isScholarship ? '📚' : '🏆'}</span>
                <div className="macos-award-info">
                  <h4>{award.link ? <a href={award.link} target="_blank" rel="noopener noreferrer">{getText(award.title)}</a> : getText(award.title)}</h4>
                  <p>{getText(award.organization)}</p>
                  <span className="macos-award-year">{award.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactContent() {
  return (
    <div className="macos-contacts-content">
      <div className="macos-contact-card">
        <div className="macos-contact-header">
          <div className="macos-contact-avatar">{getText(resumeData.personal.name).charAt(0)}</div>
          <h2>{getText(resumeData.personal.name)}</h2>
          <p>{getText(resumeData.personal.title)}</p>
        </div>
        <div className="macos-contact-details">
          <div className="macos-contact-row">
            <span className="macos-contact-label">email</span>
            <a href={`mailto:${resumeData.personal.email}`} className="macos-contact-value">{resumeData.personal.email}</a>
          </div>
          <div className="macos-contact-row">
            <span className="macos-contact-label">github</span>
            <a href={resumeData.personal.github} target="_blank" rel="noopener noreferrer" className="macos-contact-value">{resumeData.personal.github.replace('https://', '')}</a>
          </div>
          <div className="macos-contact-row">
            <span className="macos-contact-label">linkedin</span>
            <a href={resumeData.personal.linkedin} target="_blank" rel="noopener noreferrer" className="macos-contact-value">{resumeData.personal.linkedin.replace('https://', '')}</a>
          </div>
          <div className="macos-contact-row">
            <span className="macos-contact-label">location</span>
            <span className="macos-contact-value">{getText(resumeData.personal.location)}</span>
          </div>
        </div>
        <div className="macos-contact-skills">
          <h3>Skills</h3>
          <div className="macos-skill-tags">
            {resumeData.skills.programming.map((s, i) => <span key={i} className="macos-skill-tag">{s.name}</span>)}
            {resumeData.skills.technologies.map((s, i) => <span key={`tech-${i}`} className="macos-skill-tag tech">{s.name}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// About This Mac 다이얼로그
function AboutMacDialog({ onClose }) {
  return (
    <motion.div
      className="macos-dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="macos-about-mac"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="macos-about-logo">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="38" fill="linear-gradient(180deg, #5856D6 0%, #AF52DE 100%)"/>
            <text x="40" y="55" textAnchor="middle" fill="white" fontSize="48" fontWeight="300"></text>
          </svg>
        </div>
        <h1>macOS Sequoia</h1>
        <p className="macos-version">Version 15.2</p>
        <div className="macos-about-info">
          <p><strong>MacBook Pro (Portfolio)</strong></p>
          <p>Chip: {getText(resumeData.personal.name)}</p>
          <p>Memory: Full-Stack Engineer</p>
          <p>Serial: {resumeData.personal.email}</p>
        </div>
        <button className="macos-about-btn" onClick={onClose}>OK</button>
      </motion.div>
    </motion.div>
  )
}

// Launchpad
function Launchpad({ onClose, onOpenApp }) {
  const apps = [
    { id: 'about', name: 'About Me', icon: 'textedit' },
    { id: 'education', name: 'Education', icon: 'preview' },
    { id: 'experience', name: 'Experience', icon: 'app' },
    { id: 'projects', name: 'Projects', icon: 'folder' },
    { id: 'awards', name: 'Awards', icon: 'preview' },
    { id: 'contact', name: 'Contact', icon: 'contacts' },
    { id: 'safari', name: 'Safari', icon: 'safari' },
    { id: 'notes', name: 'Notes', icon: 'notes' },
    { id: 'mail', name: 'Mail', icon: 'mail' },
    { id: 'music', name: 'Music', icon: 'music' },
    { id: 'photos', name: 'Photos', icon: 'photos' },
    { id: 'settings', name: 'Settings', icon: 'settings' },
  ]

  return (
    <motion.div
      className="macos-launchpad"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="macos-launchpad-grid" onClick={e => e.stopPropagation()}>
        {apps.map(app => (
          <div
            key={app.id}
            className="macos-launchpad-item"
            onClick={() => { onOpenApp(app.id); onClose() }}
          >
            <div className="macos-launchpad-icon">
              <AppIcon type={app.icon} size={80} />
            </div>
            <span>{app.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Dock
function Dock({ minimizedWindows, onRestore, onDockClick, runningApps }) {
  return (
    <div className="macos-dock-container">
      <div className="macos-dock">
        {DOCK_APPS.map(app => (
          <div
            key={app.id}
            className="macos-dock-item"
            title={app.name}
            onClick={() => onDockClick(app)}
          >
            <AppIcon type={app.icon} size={48} />
            {runningApps.includes(app.id) && <div className="macos-dock-indicator" />}
          </div>
        ))}
        {minimizedWindows.length > 0 && <div className="macos-dock-divider" />}
        {minimizedWindows.map(win => (
          <div key={win.id} className="macos-dock-item minimized" title={win.title} onClick={() => onRestore(win.id)}>
            <AppIcon type={win.iconType || 'app'} size={48} />
            <div className="macos-dock-indicator" />
          </div>
        ))}
        <div className="macos-dock-divider" />
        <div className="macos-dock-item" title="Trash">
          <AppIcon type="trash" size={48} />
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function MacOSDesktopView() {
  const [windows, setWindows] = useState([])
  const [minimizedWindows, setMinimizedWindows] = useState([])
  const [selectedIcon, setSelectedIcon] = useState(null)
  const [nextZIndex, setNextZIndex] = useState(1)
  const [dragging, setDragging] = useState(null)
  const [activeApp, setActiveApp] = useState('Finder')
  const [openMenu, setOpenMenu] = useState(null)
  const [showAboutMac, setShowAboutMac] = useState(false)
  const [showLaunchpad, setShowLaunchpad] = useState(false)
  const [runningApps, setRunningApps] = useState(['finder'])

  const containerRef = useRef(null)

  const openWindow = useCallback((iconId) => {
    const icon = DESKTOP_ICONS.find(i => i.id === iconId)
    if (!icon) return

    const existingWindow = windows.find(w => w.iconId === iconId)
    if (existingWindow) {
      focusWindow(existingWindow.id)
      return
    }

    const minimized = minimizedWindows.find(w => w.iconId === iconId)
    if (minimized) {
      restoreWindow(minimized.id)
      return
    }

    let content, width = 600, height = 400, type = 'default'

    switch (iconId) {
      case 'about': content = <AboutContent />; width = 480; height = 360; type = 'textedit'; break
      case 'education': content = <EducationContent />; width = 650; height = 500; type = 'preview'; break
      case 'experience': content = <ExperienceContent />; width = 750; height = 480; type = 'app'; break
      case 'projects': content = <ProjectsContent />; width = 850; height = 520; type = 'finder'; break
      case 'awards': content = <AwardsContent />; width = 700; height = 550; type = 'preview'; break
      case 'contact': content = <ContactContent />; width = 420; height = 520; type = 'contacts'; break
      default: content = <div>Unknown</div>
    }

    const newWindow = {
      id: `window-${Date.now()}`,
      iconId,
      title: icon.name,
      iconType: icon.icon,
      x: 150 + windows.length * 30,
      y: 60 + windows.length * 30,
      width, height, type, content,
      zIndex: nextZIndex
    }

    setWindows(prev => [...prev, newWindow])
    setNextZIndex(prev => prev + 1)
    setActiveApp(icon.name)
    setRunningApps(prev => prev.includes(iconId) ? prev : [...prev, iconId])
  }, [windows, minimizedWindows, nextZIndex])

  const focusWindow = useCallback((windowId) => {
    const win = windows.find(w => w.id === windowId)
    if (win) setActiveApp(win.title)
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, zIndex: nextZIndex } : w))
    setNextZIndex(prev => prev + 1)
  }, [nextZIndex, windows])

  const closeWindow = useCallback((windowId) => {
    setWindows(prev => {
      const win = prev.find(w => w.id === windowId)
      const remaining = prev.filter(w => w.id !== windowId)
      if (win) setRunningApps(r => r.filter(id => id !== win.iconId))
      if (remaining.length > 0) {
        const topWindow = remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b)
        setActiveApp(topWindow.title)
      } else {
        setActiveApp('Finder')
      }
      return remaining
    })
  }, [])

  const minimizeWindow = useCallback((windowId) => {
    const win = windows.find(w => w.id === windowId)
    if (win) {
      setMinimizedWindows(prev => [...prev, win])
      setWindows(prev => {
        const remaining = prev.filter(w => w.id !== windowId)
        if (remaining.length > 0) {
          setActiveApp(remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b).title)
        } else {
          setActiveApp('Finder')
        }
        return remaining
      })
    }
  }, [windows])

  const restoreWindow = useCallback((windowId) => {
    const win = minimizedWindows.find(w => w.id === windowId)
    if (win) {
      setMinimizedWindows(prev => prev.filter(w => w.id !== windowId))
      setWindows(prev => [...prev, { ...win, zIndex: nextZIndex }])
      setNextZIndex(prev => prev + 1)
      setActiveApp(win.title)
    }
  }, [minimizedWindows, nextZIndex])

  const handleDragStart = useCallback((e, windowId) => {
    const win = windows.find(w => w.id === windowId)
    if (win) {
      setDragging({ id: windowId, startX: e.clientX - win.x, startY: e.clientY - win.y })
      focusWindow(windowId)
    }
  }, [windows, focusWindow])

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    setWindows(prev => prev.map(w => w.id === dragging.id ? { ...w, x: e.clientX - dragging.startX, y: Math.max(25, e.clientY - dragging.startY) } : w))
  }, [dragging])

  const handleMouseUp = useCallback(() => setDragging(null), [])

  const handleDockClick = useCallback((app) => {
    if (app.action === 'launchpad') {
      setShowLaunchpad(true)
    } else if (app.action === 'finder') {
      openWindow('projects')
    } else if (app.action === 'safari') {
      window.open(resumeData.personal.github, '_blank')
    } else if (app.action === 'mail') {
      window.location.href = `mailto:${resumeData.personal.email}`
    } else if (app.action === 'settings') {
      setShowAboutMac(true)
    } else if (app.action === 'notes') {
      openWindow('about')
    }
  }, [openWindow])

  const handleMenuAction = useCallback((action) => {
    if (action === 'aboutMac') setShowAboutMac(true)
    if (action === 'spotlight') setShowLaunchpad(true)
  }, [])

  return (
    <div
      className="macos-desktop-view"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => { setSelectedIcon(null); setOpenMenu(null) }}
    >
      <div className="macos-wallpaper" />
      <MenuBar activeApp={activeApp} openMenu={openMenu} setOpenMenu={setOpenMenu} onMenuAction={handleMenuAction} />

      {DESKTOP_ICONS.map(icon => (
        <DesktopIcon
          key={icon.id}
          icon={icon}
          selected={selectedIcon === icon.id}
          onSelect={setSelectedIcon}
          onOpen={openWindow}
          constraintsRef={containerRef}
        />
      ))}

      <AnimatePresence>
        {windows.map(win => (
          <Window
            key={win.id}
            window={win}
            isActive={win.zIndex === Math.max(...windows.map(w => w.zIndex))}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onFocus={focusWindow}
            onDragStart={handleDragStart}
          />
        ))}
      </AnimatePresence>

      <Dock minimizedWindows={minimizedWindows} onRestore={restoreWindow} onDockClick={handleDockClick} runningApps={runningApps} />

      <AnimatePresence>
        {showAboutMac && <AboutMacDialog onClose={() => setShowAboutMac(false)} />}
        {showLaunchpad && <Launchpad onClose={() => setShowLaunchpad(false)} onOpenApp={openWindow} />}
      </AnimatePresence>

      <StyleSwitcher />
    </div>
  )
}
