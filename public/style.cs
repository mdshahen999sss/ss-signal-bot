* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

body {
    background-color: #0b0f17;
    color: #c9d1d9;
    display: flex;
    justify-content: center;
    padding: 12px;
}

.app-container {
    width: 100%;
    max-width: 440px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

/* Header */
.app-header {
    text-align: center;
    padding: 5px 0 2px 0;
}

.logo-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.logo-title h1 {
    color: #2ea043;
    font-size: 1.5rem;
    letter-spacing: 1px;
    font-weight: 800;
}

.subtitle {
    color: #8b949e;
    font-size: 0.75rem;
    margin-top: 2px;
}

/* Common Card Style */
.card {
    background: #121824;
    border: 1px solid #1f293d;
    border-radius: 12px;
    padding: 14px;
}

/* Control Panel */
.select-group {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
}

.field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.field label {
    font-size: 0.75rem;
    color: #8b949e;
}

select {
    width: 100%;
    background: #090d16;
    border: 1px solid #2d3748;
    color: #fff;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 0.85rem;
    outline: none;
}

.btn-generate {
    width: 100%;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
    border: none;
    padding: 11px;
    font-size: 0.95rem;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

/* Main Signal Card */
.card-top-bar {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #8b949e;
    margin-bottom: 12px;
}

.asset-title {
    font-weight: bold;
    color: #e6edf3;
}

.signal-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 150px;
    margin: 10px 0;
}

.signal-img {
    height: 140px;
    width: auto;
    object-fit: contain;
}

/* Entry Dashed Box */
.entry-box {
    border: 1px dashed #10b981;
    background: rgba(16, 185, 129, 0.05);
    color: #10b981;
    text-align: center;
    padding: 8px;
    border-radius: 6px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.timer-subtext {
    text-align: center;
    color: #38ef7d;
    font-size: 0.8rem;
    margin-top: 6px;
}

.progress-wrap {
    margin-top: 10px;
}

.progress-text {
    text-align: center;
    font-size: 0.75rem;
    color: #8b949e;
    margin-bottom: 4px;
}

.progress-bg {
    background: #1c2433;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    background: #10b981;
    height: 100%;
}

.price-strip {
    display: flex;
    justify-content: space-between;
    background: #090d16;
    padding: 8px 10px;
    border-radius: 6px;
    margin-top: 12px;
    font-size: 0.75rem;
    color: #8b949e;
}

.price-strip b {
    color: #e6edf3;
}

/* AI Analysis Section */
.section-title {
    color: #10b981;
    font-size: 0.9rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.analysis-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
}

.info-card {
    background: #121824;
    border: 1px solid #1f293d;
    padding: 8px 10px;
    border-radius: 8px;
}

.info-card label {
    font-size: 0.7rem;
    color: #6e7681;
    display: block;
    margin-bottom: 2px;
}

.info-card .val {
    font-size: 0.8rem;
    font-weight: 600;
    color: #e6edf3;
}

.highlight {
    color: #10b981 !important;
}

/* History Section */
.table-wrap {
    background: #121824;
    border: 1px solid #1f293d;
    border-radius: 8px;
    overflow: hidden;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
}

th, td {
    padding: 8px 4px;
    text-align: center;
}

th {
    background: #182030;
    color: #8b949e;
    font-weight: 500;
}

tr {
    border-bottom: 1px solid #1f293d;
}

tr:last-child {
    border-bottom: none;
}
