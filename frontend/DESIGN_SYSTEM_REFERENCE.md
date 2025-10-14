# 🎨 Design System Reference Guide

## Color Palette

### Primary Gradient
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
**Used for**: Body background, header gradients, primary buttons

### Stat Card Gradients
1. **Green (Sales)**: `linear-gradient(135deg, #11998e 0%, #38ef7d 100%)`
2. **Blue (Growth)**: `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`
3. **Purple (Orders)**: `linear-gradient(135deg, #a855f7 0%, #ec4899 100%)`
4. **Pink (Value)**: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`

### Alert Gradients
- **Success**: `linear-gradient(135deg, #16a34a 0%, #15803d 100%)`
- **Danger**: `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)`
- **Warning**: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`

---

## Button Components

### .btn-modern (Primary Action)
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
padding: 12px 24px;
border-radius: 12px;
font-weight: bold;
```
**Hover**: Lift effect + glow shadow  
**Used for**: Add Menu Item, Add Staff, Generate List

### .btn-success (Save/Confirm)
```css
background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
color: white;
```
**Used for**: Save buttons, Update actions

### .btn-danger (Delete/Remove)
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
color: white;
```
**Used for**: Delete Menu Item, Remove Staff

### .btn-outline (Secondary)
```css
border: 2px solid white;
color: white;
background: transparent;
```
**Hover**: Fill with white, text turns purple  
**Used for**: Cancel, Edit, Logout

### .btn-icon (Icon Button)
```css
width: 40px;
height: 40px;
border-radius: 50%;
```
**Hover**: Rotate 90deg  
**Used for**: Close modals

---

## Card Components

### .stat-card
```css
background: white;
backdrop-filter: blur(10px);
border-radius: 16px;
padding: 24px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```
**Features**:
- Gradient overlay in corner
- Large circular icon background
- Trend indicator at bottom
- Lift animation on hover

**Structure**:
```html
<div class="stat-card animate-scale-in">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-gray-600">Label</p>
      <p class="text-3xl font-bold">$1,234</p>
    </div>
    <div class="w-16 h-16 rounded-full gradient-bg">
      <Icon />
    </div>
  </div>
  <p class="text-xs text-green-600">↑ 12% indicator</p>
</div>
```

### .menu-card
```css
background: white;
border-radius: 16px;
overflow: hidden;
```
**Features**:
- Image section (240px height)
- Image zoom on hover (scale 1.1)
- Gradient overlay with category badge
- Card body with title, price, description
- Action buttons at bottom

**Structure**:
```html
<div class="menu-card animate-scale-in">
  <div class="menu-image">
    <img src="..." />
    <div class="menu-overlay">
      <span>Category</span>
    </div>
  </div>
  <div class="p-5">
    <h3>Dish Name</h3>
    <span class="gradient-text">$12.99</span>
    <p>Description</p>
    <div class="buttons">...</div>
  </div>
</div>
```

### .inventory-card
```css
background: white;
padding: 16px;
border-radius: 12px;
```
**Features**:
- Slide animation on hover
- Bold ingredient name
- Current vs Min quantity display
- Urgency badge

### .glass
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```
**Used for**: Tab container, modals, cards

### .glass-dark
```css
background: rgba(0, 0, 0, 0.2);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```
**Used for**: Navigation tabs, modal backgrounds

---

## Animation Classes

### .animate-fade-in
```css
animation: fadeIn 0.5s ease-out;
opacity: 0 → 1
```

### .animate-slide-in-left
```css
animation: slideInLeft 0.6s ease-out;
translateX: -20px → 0
opacity: 0 → 1
```

### .animate-slide-in-right
```css
animation: slideInRight 0.6s ease-out;
translateX: 20px → 0
opacity: 0 → 1
```

### .animate-scale-in
```css
animation: scaleIn 0.5s ease-out;
scale: 0.9 → 1
opacity: 0 → 1
```

### Staggered Delays
```html
<div style="animation-delay: 0.1s">...</div>
<div style="animation-delay: 0.2s">...</div>
<div style="animation-delay: 0.3s">...</div>
```

---

## Layout Structure

### Page Container
```html
<div class="min-h-screen">
  <!-- Header with glass effect -->
  <header class="glass animate-fade-in">
    <h1 class="text-white">Dashboard</h1>
    <button class="btn-outline">Logout</button>
  </header>
  
  <!-- Tabs with glass-dark -->
  <nav class="glass-dark">
    <button class="active">Tab 1</button>
    <button>Tab 2</button>
  </nav>
  
  <!-- Main content -->
  <main class="max-w-7xl mx-auto px-6 py-8">
    <!-- Tab content here -->
  </main>
</div>
```

### Grid Layouts

**Stats (4 columns)**:
```html
<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
  <div class="stat-card">...</div>
</div>
```

**Menu Items (3 columns)**:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="menu-card">...</div>
</div>
```

**Grocery List (2 columns)**:
```html
<div class="grid grid-cols-2 gap-4">
  <div>...</div>
</div>
```

---

## Typography Scale

### Headers
```css
h1: 2.5rem (40px), bold, white
h2: 2rem (32px), bold, white
h3: 1.5rem (24px), bold, white
```

### Body Text
```css
Base: 1rem (16px), white
Small: 0.875rem (14px), white opacity-80
Tiny: 0.75rem (12px), white opacity-70
```

### Font Weights
```css
Normal: 400
Medium: 500
Semibold: 600
Bold: 700
```

---

## Icon Usage

### Lucide React Icons
- **ChefHat**: Menu items, menu modal
- **DollarSign**: Sales stats, pricing
- **Receipt**: Orders stat
- **TrendingUp**: Week sales
- **AlertTriangle**: Low stock alerts
- **Plus**: Add buttons
- **Edit**: Edit actions
- **Trash2**: Delete actions
- **Save**: Save buttons
- **X**: Close modals
- **Sparkles**: AI insights
- **ShoppingCart**: Grocery list
- **Brain**: AI suggestions
- **Users**: Staff section
- **Package**: Inventory section

### Icon Sizes
```css
Small: w-4 h-4 (16px)
Medium: w-5 h-5 (20px)
Large: w-6 h-6 (24px)
XLarge: w-8 h-8 (32px)
```

---

## Spacing System

### Padding
```css
p-2: 8px
p-3: 12px
p-4: 16px
p-5: 20px
p-6: 24px
```

### Gap
```css
gap-2: 8px
gap-3: 12px
gap-4: 16px
gap-6: 24px
```

### Margin
```css
mb-2: 8px
mb-3: 12px
mb-4: 16px
mb-6: 24px
```

---

## Modal Structure

```html
<!-- Backdrop with blur -->
<div class="fixed inset-0 animate-fade-in" 
     style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px)">
  
  <!-- Modal container -->
  <div class="glass-dark rounded-2xl max-w-2xl animate-scale-in">
    
    <!-- Header -->
    <div class="p-6 border-b border-white border-opacity-20">
      <h3 class="text-white flex items-center gap-2">
        <Icon />
        Title
      </h3>
      <button class="btn-icon">
        <X />
      </button>
    </div>
    
    <!-- Body -->
    <div class="p-6">
      <input class="bg-white bg-opacity-20 border-white..." />
    </div>
    
    <!-- Footer -->
    <div class="p-6 border-t border-white border-opacity-20">
      <button class="btn-outline">Cancel</button>
      <button class="btn-success">Save</button>
    </div>
  </div>
</div>
```

---

## Quick Copy Templates

### Stat Card Template
```jsx
<div className="stat-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
  <div className="flex items-center justify-between mb-3">
    <div>
      <p className="text-gray-600 text-sm font-medium">Label</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">$1,234</p>
    </div>
    <div className="w-16 h-16 rounded-full flex items-center justify-center" 
         style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
      <Icon className="w-8 h-8 text-white" />
    </div>
  </div>
  <p className="text-xs text-green-600 font-medium">↑ 12% from yesterday</p>
</div>
```

### Menu Card Template
```jsx
<div className="menu-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
  <div className="menu-image">
    <img src={item.image} alt={item.name} />
    <div className="menu-overlay">
      <span className="text-white text-xs font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
        {item.category}
      </span>
    </div>
  </div>
  <div className="p-5">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
      <span className="text-xl font-bold gradient-text">${item.price}</span>
    </div>
    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
    <div className="flex gap-2">
      <button className="flex-1 btn-outline">Edit</button>
      <button className="flex-1 btn-danger">Delete</button>
    </div>
  </div>
</div>
```

---

**Reference File**: Use this guide when applying styles to other pages  
**Last Updated**: Dashboard UI Modernization Complete  
**Version**: 1.0
