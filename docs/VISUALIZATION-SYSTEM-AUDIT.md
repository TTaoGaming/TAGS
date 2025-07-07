# 🎨 Visualization System Architecture & Diagnostic Guide

## **Quick Navigation**
- [🔍 Instant Diagnostic Tool](#instant-diagnostic-tool) - Copy-paste console commands
- [📊 System Architecture](#system-architecture) - How it all works
- [🎯 Canvas Layer System](#canvas-layer-system) - Multi-canvas setup
- [⚙️ Manager Strategy Pattern](#manager-strategy-pattern) - Modular visualization switching
- [🛠️ Troubleshooting Guide](#troubleshooting-guide) - Common issues & fixes

---

## **🔍 Instant Diagnostic Tool**

**Copy-paste this into your browser console to get complete visualization system status:**

```javascript
// 🎨 VISUALIZATION SYSTEM DIAGNOSTIC v1.0
// =======================================
// Comprehensive analysis of TAGS-MVP visualization architecture

console.log('\n🎨 VISUALIZATION SYSTEM DIAGNOSTIC STARTING...\n');

function visualizationSystemDiagnostic() {
  const results = {
    timestamp: new Date().toISOString(),
    canvases: {},
    managers: {},
    strategies: {},
    settings: {},
    performance: {},
    warnings: [],
    summary: {}
  };

  // ===== CANVAS LAYER ANALYSIS =====
  console.log('📊 CANVAS LAYER ANALYSIS:');
  
  const canvasElements = document.querySelectorAll('canvas');
  results.canvases.total = canvasElements.length;
  results.canvases.details = [];
  
  canvasElements.forEach((canvas, index) => {
    const rect = canvas.getBoundingClientRect();
    const style = window.getComputedStyle(canvas);
    const canvasInfo = {
      id: canvas.id || `canvas-${index}`,
      dimensions: `${canvas.width}x${canvas.height}`,
      displaySize: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
      position: `${style.position}`,
      zIndex: style.zIndex || 'auto',
      visibility: style.display !== 'none' ? 'visible' : 'hidden',
      context: canvas.getContext('2d') ? '2D' : 'unknown'
    };
    results.canvases.details.push(canvasInfo);
    
    const visibilityIcon = canvasInfo.visibility === 'visible' ? '✅' : '❌';
    console.log(`   ${visibilityIcon} ${canvasInfo.id}: ${canvasInfo.dimensions} (z:${canvasInfo.zIndex}) - ${canvasInfo.visibility}`);
  });

  // ===== VISUALIZATION MANAGERS ANALYSIS =====
  console.log('\n🎯 VISUALIZATION MANAGERS:');
  
  // Anchor Visualization Manager
  if (typeof AnchorVisualizationManager !== 'undefined') {
    const anchorInfo = {
      available: true,
      currentStrategy: AnchorVisualizationManager.currentStrategy?.name || 'none',
      totalStrategies: AnchorVisualizationManager.strategies?.size || 0,
      strategyList: Array.from(AnchorVisualizationManager.strategies?.keys() || [])
    };
    results.managers.anchor = anchorInfo;
    console.log(`   ⚓ AnchorVisualizationManager: ✅ Active (${anchorInfo.currentStrategy})`);
    console.log(`      📋 Available: [${anchorInfo.strategyList.join(', ')}]`);
  } else {
    results.managers.anchor = { available: false };
    results.warnings.push('AnchorVisualizationManager not found');
    console.log('   ⚓ AnchorVisualizationManager: ❌ Not found');
  }

  // Hand Skeleton Manager
  if (typeof HandSkeletonVisualizationManager !== 'undefined') {
    const skeletonInfo = {
      available: true,
      currentStrategy: HandSkeletonVisualizationManager.currentStrategy?.name || 'none',
      enabled: HandSkeletonVisualizationManager.isEnabled,
      totalStrategies: HandSkeletonVisualizationManager.strategies?.size || 0,
      strategyList: Array.from(HandSkeletonVisualizationManager.strategies?.keys() || [])
    };
    results.managers.skeleton = skeletonInfo;
    console.log(`   🦴 HandSkeletonVisualizationManager: ✅ Active (${skeletonInfo.currentStrategy})`);
    console.log(`      📋 Available: [${skeletonInfo.strategyList.join(', ')}]`);
  } else {
    results.managers.skeleton = { available: false };
    results.warnings.push('HandSkeletonVisualizationManager not found');
    console.log('   🦴 HandSkeletonVisualizationManager: ❌ Not found');
  }

  // Pinch Visualization Manager
  if (typeof PinchVisualizationManager !== 'undefined') {
    const pinchInfo = {
      available: true,
      currentStrategy: PinchVisualizationManager.currentStrategy?.name || 'none',
      enabled: PinchVisualizationManager.isEnabled,
      totalStrategies: PinchVisualizationManager.availableStrategies?.size || 0,
      strategyList: Array.from(PinchVisualizationManager.availableStrategies?.keys() || [])
    };
    results.managers.pinch = pinchInfo;
    console.log(`   🤏 PinchVisualizationManager: ✅ Active (${pinchInfo.currentStrategy})`);
    console.log(`      📋 Available: [${pinchInfo.strategyList.join(', ')}]`);
  } else {
    results.managers.pinch = { available: false };
    results.warnings.push('PinchVisualizationManager not found');
    console.log('   🤏 PinchVisualizationManager: ❌ Not found');
  }

  // ===== SETTINGS ANALYSIS =====
  console.log('\n⚙️ VISUALIZATION SETTINGS:');
  
  if (typeof UnifiedSettingsManager !== 'undefined') {
    const coreSettings = UnifiedSettingsManager.load('CORE');
    results.settings = {
      handSkeletonStyle: coreSettings?.handSkeletonStyle || 'unknown',
      pinchVisualizationStyle: coreSettings?.pinchVisualizationStyle || 'unknown',
      anchorVisualizationStyle: coreSettings?.anchorVisualizationStyle || 'unknown'
    };
    
    console.log(`   🦴 Hand Skeleton: ${results.settings.handSkeletonStyle}`);
    console.log(`   🤏 Pinch Visualization: ${results.settings.pinchVisualizationStyle}`);
    console.log(`   ⚓ Anchor Visualization: ${results.settings.anchorVisualizationStyle}`);
  } else {
    results.warnings.push('UnifiedSettingsManager not found');
    console.log('   ❌ UnifiedSettingsManager not available');
  }

  // ===== PERFORMANCE ANALYSIS =====
  console.log('\n⚡ PERFORMANCE ANALYSIS:');
  
  results.performance = {
    totalCanvases: canvasElements.length,
    visibleCanvases: Array.from(canvasElements).filter(c => window.getComputedStyle(c).display !== 'none').length,
    activeManagers: Object.values(results.managers).filter(m => m.available).length,
    memoryUsage: performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'unavailable'
  };
  
  console.log(`   📊 Canvas Elements: ${results.performance.totalCanvases} total, ${results.performance.visibleCanvases} visible`);
  console.log(`   🎯 Active Managers: ${results.performance.activeManagers}/3`);
  console.log(`   💾 Memory Usage: ${results.performance.memoryUsage}`);
  
  if (results.performance.totalCanvases > 5) {
    results.warnings.push(`High canvas count (${results.performance.totalCanvases}) may impact performance`);
  }

  // ===== INTEGRATION TESTS =====
  console.log('\n🧪 INTEGRATION TESTS:');
  
  // Test strategy switching
  const switchTests = [];
  if (results.managers.anchor?.available) {
    try {
      const originalStrategy = AnchorVisualizationManager.currentStrategy?.name;
      const testResult = AnchorVisualizationManager.switchStrategy('off');
      if (originalStrategy) AnchorVisualizationManager.switchStrategy(originalStrategy);
      switchTests.push({ manager: 'Anchor', success: testResult });
      console.log(`   ⚓ Anchor strategy switching: ${testResult ? '✅' : '❌'}`);
    } catch (e) {
      switchTests.push({ manager: 'Anchor', success: false, error: e.message });
      console.log(`   ⚓ Anchor strategy switching: ❌ ${e.message}`);
    }
  }

  // ===== WARNINGS & RECOMMENDATIONS =====
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach(warning => {
      console.log(`   ⚠️ ${warning}`);
    });
  }

  // ===== SUMMARY =====
  console.log('\n📋 SUMMARY:');
  results.summary = {
    systemHealth: results.warnings.length === 0 ? 'healthy' : 'needs attention',
    managersWorking: `${results.performance.activeManagers}/3`,
    canvasesVisible: `${results.performance.visibleCanvases}/${results.performance.totalCanvases}`,
    readyForFAB: results.performance.activeManagers >= 2 && results.performance.visibleCanvases >= 1
  };
  
  console.log(`   🎯 System Health: ${results.summary.systemHealth}`);
  console.log(`   📊 Managers Working: ${results.summary.managersWorking}`);
  console.log(`   🎨 Canvases Visible: ${results.summary.canvasesVisible}`);
  console.log(`   🚀 Ready for FAB Integration: ${results.summary.readyForFAB ? '✅' : '❌'}`);

  console.log('\n🎯 DIAGNOSTIC COMPLETE!');
  console.log('📋 Full results available in: window.lastVisualizationDiagnostic');
  
  // Store results globally for detailed inspection
  window.lastVisualizationDiagnostic = results;
  
  return results;
}

// Run the diagnostic
const diagnosticResults = visualizationSystemDiagnostic();

// Quick access commands
console.log('\n🛠️ QUICK ACCESS COMMANDS:');
console.log('   • window.lastVisualizationDiagnostic - Full diagnostic results');
console.log('   • AnchorVisualizationManager.getAvailableStrategies() - Anchor strategies');
console.log('   • HandSkeletonVisualizationManager.getAvailableStrategies() - Skeleton strategies');
console.log('   • PinchVisualizationManager.getAvailableStrategies() - Pinch strategies');
console.log('   • document.querySelectorAll("canvas") - All canvas elements');

diagnosticResults;
```

---

## **📊 System Architecture**

Your visualization system uses a **3-layer architecture** with the **Strategy Pattern** for modular visualization switching:

### **🎯 Core Components**

1. **Three Visualization Managers** (Strategy Pattern):
   - `AnchorVisualizationManager` - Spatial anchor visualization
   - `HandSkeletonVisualizationManager` - Hand skeleton rendering  
   - `PinchVisualizationManager` - Pinch detection feedback

2. **Multi-Canvas Layer System** (Z-index layering):
   - Video background layer (z-index 400)
   - Hand tracking overlay (z-index 450) 
   - Piano Genie interface (z-index 550)

3. **Settings Persistence** (UnifiedSettingsManager):
   - Strategy selections persist across sessions
   - Category-based storage (CORE, UI, SYSTEM, MIDI)
   - Automatic fallback handling

---

## **🎯 Canvas Layer System**

Your app uses **multiple canvases** in a **layered z-index system**:

```
🎹 Piano Genie Canvas     (z-index: 550) ← Top layer
🎨 Hand Tracking Overlay  (z-index: 450) ← Hand skeleton/anchors
📹 Video Background       (z-index: 400) ← Camera feed
🌐 Page Content           (z-index: 1)   ← UI elements
```

### **Canvas Elements**:
- `handsfree-canvas-video-1` - Camera video background
- `handsfree-canvas-handpose-1` - Hand tracking visualization
- `mediaPipeCanvas` - Currently hidden (legacy)
- Piano Genie iframe canvas - Musical interface

---

## **⚙️ Manager Strategy Pattern**

Each visualization manager implements the **Strategy Pattern** for hot-swappable visualization modes:

### **🎨 Available Strategies**:

**AnchorVisualizationManager**:
- `classic` - Traditional anchor visualization
- `gaming-minimal` - Minimal gaming-style anchors
- `off` - No anchor visualization

**HandSkeletonVisualizationManager**:
- `rainbow` - Colorful educational skeleton
- `off` - No skeleton visualization

**PinchVisualizationManager**:
- `rainbow-musical` - Educational finger colors + musical notes
- `minimal` - Simple pinch indicators
- `off` - No pinch visualization

### **🔄 Strategy Switching**:
```javascript
// Switch strategies programmatically
AnchorVisualizationManager.switchStrategy('gaming-minimal');
HandSkeletonVisualizationManager.switchStrategy('rainbow'); 
PinchVisualizationManager.switchStrategy('rainbow-musical');
```

---

## **🛠️ Troubleshooting Guide**

### **Common Issues & Solutions**:

**🔍 Canvas Not Visible**:
```javascript
// Check canvas visibility
document.querySelectorAll('canvas').forEach(canvas => {
  console.log(`${canvas.id}: ${getComputedStyle(canvas).display}`);
});
```

**🎯 Manager Not Working**:
```javascript
// Check manager initialization
console.log('Anchor:', typeof AnchorVisualizationManager !== 'undefined');
console.log('Skeleton:', typeof HandSkeletonVisualizationManager !== 'undefined');  
console.log('Pinch:', typeof PinchVisualizationManager !== 'undefined');
```

**⚙️ Strategy Not Switching**:
```javascript
// Check available strategies
AnchorVisualizationManager.getAvailableStrategies();
// Force strategy switch with fallback
AnchorVisualizationManager.switchStrategy('off') || console.log('Switch failed');
```

**🎨 Performance Issues**:
```javascript
// Check canvas count (should be ≤ 5)
console.log(`Canvas count: ${document.querySelectorAll('canvas').length}`);
// Check memory usage
console.log(`Memory: ${Math.round(performance.memory.usedJSHeapSize/1024/1024)}MB`);
```

---

## **🚀 FAB Integration Readiness**

Your visualization system is **ready for FAB integration** when:

✅ **At least 2/3 managers are active**  
✅ **At least 1 canvas is visible**  
✅ **No critical warnings in diagnostic**  
✅ **Strategy switching works correctly**

Run the diagnostic tool to verify readiness before FAB integration!

---

## **📚 Quick Reference**

### **Key Navigation Points**:
- **Visualization Settings Card** - UI control panel
- **Advanced Options** - Individual strategy controls  
- **Console Diagnostic** - Runtime system analysis
- **UnifiedSettingsManager** - Persistent configuration

### **Important Global Objects**:
- `AnchorVisualizationManager` - Anchor visualization control
- `HandSkeletonVisualizationManager` - Hand skeleton control
- `PinchVisualizationManager` - Pinch visualization control
- `UnifiedSettingsManager` - Settings persistence
- `window.lastVisualizationDiagnostic` - Latest diagnostic results
