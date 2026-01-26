# Unknown Novel

## Overview
A static web novel reading platform built with HTML, CSS, and JavaScript, using Supabase as the backend service for data storage and authentication.

## Project Structure
- `/` - Main public pages (index.html, novel.html, read.html)
- `/admin` - Admin panel pages (login.html, dashboard.html, chapters.html)
- `/assets/css` - Stylesheets
- `/assets/js` - JavaScript files including Supabase client setup

## Tech Stack
- **Frontend**: Static HTML/CSS/JavaScript
- **Backend**: Supabase (external service)
- **Server**: Python SimpleHTTPServer (for local development)

## Running the Project
The project runs on a Python static file server at port 5000:
```
python server.py
```

## Supabase Configuration
The Supabase client is configured in `assets/js/supabase.js` with:
- URL: `https://nbdqvvhoqbahkfzwkppw.supabase.co`
- Key: Public/anon key for client-side access

## Features
- Novel listing on homepage
- Chapter navigation
- Admin login and dashboard
- Chapter management for admins

## Recent Changes
- January 2026: Added Supabase CDN scripts to all HTML pages for proper client initialization
- Added `supabase` alias for `supabaseClient` for consistency
- Created Python static file server with cache-control headers
