import React from 'react'

export default function Footer() {
    return (
        <footer className="text-center py-4">
            <a href="https://delice.dev" target="_blank" rel="noopener noreferrer">
                delice.dev © {new Date().getFullYear()}
            </a>
        </footer>
    )
}
