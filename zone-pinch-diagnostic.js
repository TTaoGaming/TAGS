/**
 * 🔍 ZONE PINCH DIAGNOSTIC TRACER
 * Comprehensive event flow analysis for zone-based Piano Genie integration
 * 
 * ACTIVE BUG: Multi-key press issue in Zone-based Piano Genie integration
 * SYMPTOM: Zone 2 pinch triggers Zone 1 Piano Genie events
 * 
 * This diagnostic system will trace:
 * 1. Zone detection logic (multiple competing systems)
 * 2. Piano Genie event routing
 * 3. Event emission sequence
 * 4. Cross-zone contamination points
 */

class ZonePinchDiagnostic {
    constructor() {
        this.traceBuffer = [];
        this.isTracing = false;
        this.zoneEvents = new Map();
        this.pianoGenieEvents = [];
        this.competingSystems = [];
        
        // Color coding for different systems
        this.colors = {
            zone1: '#FF6B6B',      // Red for Zone 1
            zone2: '#4ECDC4',      // Teal for Zone 2
            pianoGenie: '#FFE66D', // Yellow for Piano Genie
            orchestrator: '#FF6B9D',// Pink for gcFreeOrchestrator
            mediaipe: '#95E1D3',   // Light green for MediaPipe
            competing: '#FF3B30'   // Alert red for competing systems
        };
        
        this.init();
    }
    
    init() {
        this.setupEventInterception();
        this.setupConsoleOverrides();
        this.createDiagnosticUI();
    }
    
    /**
     * 🎯 INTERCEPT ALL ZONE-RELATED EVENTS
     * Hook into gcFreeOrchestrator to monitor event flow
     */
    setupEventInterception() {
        if (!window.gcFreeOrchestrator) {
            console.error('🔍 DIAGNOSTIC: gcFreeOrchestrator not found - system not ready');
            return;
        }
        
        // Store original emit function
        const originalEmit = window.gcFreeOrchestrator.emit;
        
        // Override emit to trace all events
        window.gcFreeOrchestrator.emit = (eventType, data) => {
            if (this.isTracing) {
                this.traceEvent('EMIT', eventType, data);
            }
            
            // Call original function
            return originalEmit.call(window.gcFreeOrchestrator, eventType, data);
        };
        
        // Monitor specific zone events
        const zoneEvents = [
            'pinchState',
            'audio',
            'midi',
            'ui',
            'analytics',
            'pinch.zone.detected',
            'hand.precision.process',
            'hand.wrist.process'
        ];
        
        zoneEvents.forEach(eventType => {
            window.gcFreeOrchestrator.on(eventType, (data) => {
                if (this.isTracing) {
                    this.traceEvent('RECEIVED', eventType, data);
                }
            });
        });
    }
    
    /**
     * 🎯 SETUP CONSOLE OVERRIDES
     * Capture console.log messages for zone detection
     */
    setupConsoleOverrides() {
        const originalLog = console.log;
        
        console.log = (...args) => {
            if (this.isTracing) {
                const message = args.join(' ');
                if (message.includes('🎯 ZONE') || message.includes('Piano Genie') || message.includes('Zone')) {
                    this.traceConsoleMessage(message);
                }
            }
            
            return originalLog.apply(console, args);
        };
    }
    
    /**
     * 🎯 TRACE INDIVIDUAL EVENT
     */
    traceEvent(type, eventType, data) {
        const timestamp = Date.now();
        const relativeTime = this.traceBuffer.length === 0 ? 0 : timestamp - this.traceBuffer[0].timestamp;
        
        const trace = {
            timestamp,
            relativeTime,
            type,
            eventType,
            data: JSON.parse(JSON.stringify(data)), // Deep clone
            zone: this.extractZoneInfo(data),
            pianoGenieRelated: this.isPianoGenieEvent(eventType, data),
            competingSystem: this.detectCompetingSystem(eventType, data)
        };
        
        this.traceBuffer.push(trace);
        this.updateDiagnosticUI(trace);
    }
    
    /**
     * 🎯 TRACE CONSOLE MESSAGES
     */
    traceConsoleMessage(message) {
        const timestamp = Date.now();
        const relativeTime = this.traceBuffer.length === 0 ? 0 : timestamp - this.traceBuffer[0].timestamp;
        
        const trace = {
            timestamp,
            relativeTime,
            type: 'CONSOLE',
            eventType: 'console.log',
            message,
            zone: this.extractZoneFromMessage(message),
            pianoGenieRelated: message.includes('Piano Genie'),
            competingSystem: this.detectCompetingSystemFromMessage(message)
        };
        
        this.traceBuffer.push(trace);
        this.updateDiagnosticUI(trace);
    }
    
    /**
     * 🎯 EXTRACT ZONE INFORMATION
     */
    extractZoneInfo(data) {
        if (!data) return null;
        
        // Multiple ways zones are represented
        const zonePatterns = [
            data.zone,
            data.spatialZone,
            data.zoneInfo?.zone,
            data.zoneName,
            data.zoneId
        ];
        
        for (const pattern of zonePatterns) {
            if (pattern !== undefined) {
                return {
                    raw: pattern,
                    normalized: this.normalizeZone(pattern),
                    source: 'data'
                };
            }
        }
        
        // Check hand-based zone detection
        if (data.hand !== undefined) {
            return {
                raw: data.hand,
                normalized: data.hand === 0 ? 1 : 2,
                source: 'hand'
            };
        }
        
        // Check position-based zone detection
        if (data.position?.x !== undefined) {
            const zone = data.position.x < 0.5 ? 1 : 2;
            return {
                raw: data.position.x,
                normalized: zone,
                source: 'position'
            };
        }
        
        return null;
    }
    
    /**
     * 🎯 EXTRACT ZONE FROM CONSOLE MESSAGE
     */
    extractZoneFromMessage(message) {
        const zoneMatch = message.match(/Zone (\d+)/);
        if (zoneMatch) {
            return {
                raw: zoneMatch[1],
                normalized: parseInt(zoneMatch[1]),
                source: 'console'
            };
        }
        
        const leftRightMatch = message.match(/(Left|Right)/);
        if (leftRightMatch) {
            return {
                raw: leftRightMatch[1],
                normalized: leftRightMatch[1] === 'Left' ? 1 : 2,
                source: 'console'
            };
        }
        
        return null;
    }
    
    /**
     * 🎯 NORMALIZE ZONE REPRESENTATION
     */
    normalizeZone(zone) {
        if (typeof zone === 'number') return zone;
        if (zone === 'zone-left' || zone === 'Zone 1 (Left)') return 1;
        if (zone === 'zone-right' || zone === 'Zone 2 (Right)') return 2;
        if (zone === 'Left') return 1;
        if (zone === 'Right') return 2;
        return zone;
    }
    
    /**
     * 🎯 DETECT PIANO GENIE EVENTS
     */
    isPianoGenieEvent(eventType, data) {
        const pianoGeniePatterns = [
            'piano-genie',
            'piano.genie',
            'pianoGenie'
        ];
        
        return pianoGeniePatterns.some(pattern => 
            eventType.includes(pattern) || 
            JSON.stringify(data).includes(pattern)
        );
    }
    
    /**
     * 🎯 DETECT COMPETING SYSTEMS
     */
    detectCompetingSystem(eventType, data) {
        const systems = [];
        
        // Check for multiple zone detection systems
        if (data && data.zone && data.spatialZone && data.zone !== data.spatialZone) {
            systems.push('ZONE_CONFLICT');
        }
        
        // Check for hand vs position zone detection
        if (data && data.hand !== undefined && data.position?.x !== undefined) {
            const handZone = data.hand === 0 ? 1 : 2;
            const positionZone = data.position.x < 0.5 ? 1 : 2;
            if (handZone !== positionZone) {
                systems.push('HAND_POSITION_CONFLICT');
            }
        }
        
        // Check for Piano Genie routing conflicts
        if (eventType === 'audio' && data && data.pianoGenie !== undefined) {
            systems.push('PIANO_GENIE_AUDIO_ROUTING');
        }
        
        return systems;
    }
    
    /**
     * 🎯 DETECT COMPETING SYSTEMS FROM MESSAGE
     */
    detectCompetingSystemFromMessage(message) {
        const systems = [];
        
        if (message.includes('Zone 1') && message.includes('Zone 2')) {
            systems.push('MULTI_ZONE_TRIGGER');
        }
        
        if (message.includes('Piano Genie') && message.includes('Zone')) {
            systems.push('PIANO_GENIE_ZONE_BRIDGE');
        }
        
        return systems;
    }
    
    /**
     * 🎯 CREATE DIAGNOSTIC UI
     */
    createDiagnosticUI() {
        const diagnosticContainer = document.createElement('div');
        diagnosticContainer.id = 'zonePinchDiagnostic';
        diagnosticContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            border: 2px solid #007AFF;
            border-radius: 8px;
            padding: 12px;
            z-index: 9999;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 11px;
            overflow-y: auto;
            display: none;
        `;
        
        diagnosticContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #007AFF;">🔍 Zone Pinch Diagnostic</h3>
                <div>
                    <button id="startTrace" style="background: #34C759; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin-right: 4px;">START</button>
                    <button id="stopTrace" style="background: #FF3B30; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin-right: 4px;">STOP</button>
                    <button id="clearTrace" style="background: #8E8E93; color: white; border: none; padding: 4px 8px; border-radius: 4px;">CLEAR</button>
                </div>
            </div>
            
            <div id="traceStatus" style="margin-bottom: 10px; padding: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 4px;">
                Status: <span id="traceStatusText" style="color: #FF3B30;">Not tracing</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>Instructions:</strong><br>
                1. Click START<br>
                2. Make a pinch gesture in Zone 2<br>
                3. Click STOP<br>
                4. Analyze the trace results below
            </div>
            
            <div id="competingSystemsAlert" style="display: none; background: #FF3B30; color: white; padding: 6px; border-radius: 4px; margin-bottom: 10px;">
                ⚠️ COMPETING SYSTEMS DETECTED
            </div>
            
            <div id="traceResults" style="max-height: 300px; overflow-y: auto;">
                <em>No trace data yet. Click START and make a pinch gesture.</em>
            </div>
        `;
        
        document.body.appendChild(diagnosticContainer);
        
        // Add event listeners
        document.getElementById('startTrace').addEventListener('click', () => this.startTrace());
        document.getElementById('stopTrace').addEventListener('click', () => this.stopTrace());
        document.getElementById('clearTrace').addEventListener('click', () => this.clearTrace());
    }
    
    /**
     * 🎯 START TRACING
     */
    startTrace() {
        this.isTracing = true;
        this.traceBuffer = [];
        this.competingSystems = [];
        
        document.getElementById('traceStatusText').textContent = 'TRACING - Make a pinch gesture in Zone 2';
        document.getElementById('traceStatusText').style.color = '#34C759';
        
        document.getElementById('traceResults').innerHTML = '<em>Tracing active... waiting for events...</em>';
        
        console.log('🔍 ZONE DIAGNOSTIC: Tracing started - make a pinch gesture in Zone 2');
    }
    
    /**
     * 🎯 STOP TRACING
     */
    stopTrace() {
        this.isTracing = false;
        
        document.getElementById('traceStatusText').textContent = 'Analysis complete';
        document.getElementById('traceStatusText').style.color = '#007AFF';
        
        this.generateTraceReport();
        
        console.log('🔍 ZONE DIAGNOSTIC: Tracing stopped');
    }
    
    /**
     * 🎯 CLEAR TRACE
     */
    clearTrace() {
        this.traceBuffer = [];
        this.competingSystems = [];
        
        document.getElementById('traceResults').innerHTML = '<em>No trace data yet. Click START and make a pinch gesture.</em>';
        document.getElementById('competingSystemsAlert').style.display = 'none';
    }
    
    /**
     * 🎯 UPDATE DIAGNOSTIC UI
     */
    updateDiagnosticUI(trace) {
        const traceResults = document.getElementById('traceResults');
        
        if (this.traceBuffer.length === 1) {
            traceResults.innerHTML = '';
        }
        
        const traceElement = document.createElement('div');
        traceElement.style.cssText = `
            margin-bottom: 4px;
            padding: 4px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
            border-left: 3px solid ${this.getTraceColor(trace)};
        `;
        
        traceElement.innerHTML = this.formatTrace(trace);
        traceResults.appendChild(traceElement);
        
        // Auto-scroll to bottom
        traceResults.scrollTop = traceResults.scrollHeight;
        
        // Check for competing systems
        if (trace.competingSystem && trace.competingSystem.length > 0) {
            this.competingSystems.push(...trace.competingSystem);
            document.getElementById('competingSystemsAlert').style.display = 'block';
        }
    }
    
    /**
     * 🎯 GET TRACE COLOR
     */
    getTraceColor(trace) {
        if (trace.competingSystem && trace.competingSystem.length > 0) {
            return this.colors.competing;
        }
        
        if (trace.pianoGenieRelated) {
            return this.colors.pianoGenie;
        }
        
        if (trace.zone) {
            return trace.zone.normalized === 1 ? this.colors.zone1 : this.colors.zone2;
        }
        
        return this.colors.orchestrator;
    }
    
    /**
     * 🎯 FORMAT TRACE
     */
    formatTrace(trace) {
        const zoneInfo = trace.zone ? `Zone ${trace.zone.normalized} (${trace.zone.source})` : 'No zone';
        const competingInfo = trace.competingSystem && trace.competingSystem.length > 0 ? 
            `<span style="color: ${this.colors.competing};">⚠️ ${trace.competingSystem.join(', ')}</span>` : '';
        
        if (trace.type === 'CONSOLE') {
            return `
                <div style="font-size: 10px; color: #8E8E93;">+${trace.relativeTime}ms</div>
                <div><strong>CONSOLE:</strong> ${trace.message}</div>
                <div style="font-size: 10px; color: #8E8E93;">${zoneInfo} ${competingInfo}</div>
            `;
        } else {
            return `
                <div style="font-size: 10px; color: #8E8E93;">+${trace.relativeTime}ms</div>
                <div><strong>${trace.type}:</strong> ${trace.eventType}</div>
                <div style="font-size: 10px; color: #8E8E93;">${zoneInfo} ${competingInfo}</div>
                <div style="font-size: 9px; color: #8E8E93; margin-top: 2px;">${JSON.stringify(trace.data).substring(0, 100)}...</div>
            `;
        }
    }
    
    /**
     * 🎯 GENERATE TRACE REPORT
     */
    generateTraceReport() {
        const report = {
            totalEvents: this.traceBuffer.length,
            zoneEvents: this.traceBuffer.filter(t => t.zone).length,
            pianoGenieEvents: this.traceBuffer.filter(t => t.pianoGenieRelated).length,
            competingSystems: [...new Set(this.competingSystems)],
            zone1Events: this.traceBuffer.filter(t => t.zone?.normalized === 1).length,
            zone2Events: this.traceBuffer.filter(t => t.zone?.normalized === 2).length,
            crossZoneContamination: this.detectCrossZoneContamination()
        };
        
        const reportElement = document.createElement('div');
        reportElement.style.cssText = `
            margin-top: 10px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            border-top: 2px solid #007AFF;
        `;
        
        reportElement.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 6px;">📊 TRACE ANALYSIS REPORT</div>
            <div>Total Events: ${report.totalEvents}</div>
            <div>Zone 1 Events: <span style="color: ${this.colors.zone1};">${report.zone1Events}</span></div>
            <div>Zone 2 Events: <span style="color: ${this.colors.zone2};">${report.zone2Events}</span></div>
            <div>Piano Genie Events: <span style="color: ${this.colors.pianoGenie};">${report.pianoGenieEvents}</span></div>
            <div>Competing Systems: <span style="color: ${this.colors.competing};">${report.competingSystems.join(', ') || 'None'}</span></div>
            <div>Cross-Zone Contamination: <span style="color: ${report.crossZoneContamination ? this.colors.competing : '#34C759'};">${report.crossZoneContamination ? 'DETECTED' : 'None'}</span></div>
        `;
        
        document.getElementById('traceResults').appendChild(reportElement);
        
        // Log detailed report to console
        console.log('🔍 ZONE DIAGNOSTIC REPORT:', report);
        console.log('🔍 FULL TRACE BUFFER:', this.traceBuffer);
    }
    
    /**
     * 🎯 DETECT CROSS-ZONE CONTAMINATION
     */
    detectCrossZoneContamination() {
        // Look for Zone 1 events when we expect only Zone 2
        const zone2Sessions = this.traceBuffer.filter(t => t.zone?.normalized === 2);
        const zone1Sessions = this.traceBuffer.filter(t => t.zone?.normalized === 1);
        
        // If we have both Zone 1 and Zone 2 events in the same trace session,
        // and Zone 2 events came first, then Zone 1 is contaminating
        return zone2Sessions.length > 0 && zone1Sessions.length > 0;
    }
    
    /**
     * 🎯 SHOW DIAGNOSTIC UI
     */
    show() {
        document.getElementById('zonePinchDiagnostic').style.display = 'block';
    }
    
    /**
     * 🎯 HIDE DIAGNOSTIC UI
     */
    hide() {
        document.getElementById('zonePinchDiagnostic').style.display = 'none';
    }
}

// Initialize diagnostic system
window.zonePinchDiagnostic = new ZonePinchDiagnostic();

// Add global functions for easy access
window.showZoneDiagnostic = () => window.zonePinchDiagnostic.show();
window.hideZoneDiagnostic = () => window.zonePinchDiagnostic.hide();
window.startZoneTrace = () => window.zonePinchDiagnostic.startTrace();
window.stopZoneTrace = () => window.zonePinchDiagnostic.stopTrace();

// Auto-show diagnostic if URL contains debug parameter
if (window.location.search.includes('zone=debug')) {
    window.zonePinchDiagnostic.show();
}

console.log('🔍 ZONE PINCH DIAGNOSTIC LOADED');
console.log('🔍 Use: showZoneDiagnostic() to open the diagnostic panel');
console.log('🔍 Use: ?zone=debug in URL to auto-show diagnostic'); 