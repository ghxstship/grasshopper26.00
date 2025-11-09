# Vercel Deployment Troubleshooting Guide
**Date:** November 9, 2025, 6:35 PM EST  
**Issue:** Vercel not deploying despite Git pushes  
**Status:** 🔧 TROUBLESHOOTING IN PROGRESS

---

## 🚨 Current Situation

- ✅ GitHub Actions disabled
- ✅ Git pushes successful (3 commits pushed)
- ✅ Vercel settings appear correct
- ❌ **No deployments triggering**

---

## 🔍 Possible Root Causes

### 1. **Vercel Git Integration Not Properly Connected** ⚠️

**Symptoms:**
- Settings show "Connected" but deployments don't trigger
- No webhook activity in GitHub

**Check:**
1. Go to GitHub repo: `https://github.com/ghxstship/grasshopper26.00/settings/hooks`
2. Look for a webhook with URL: `hooks.vercel.com`
3. Check if it has a green checkmark ✅

**If webhook is missing or has errors:**
- Vercel isn't actually connected
- Need to reconnect the integration

---

### 2. **Production Branch Mismatch** ⚠️

**Symptoms:**
- Pushes to `main` don't trigger
- Vercel expects different branch name

**Check in Vercel:**
1. Go to: **Settings** → **Git**
2. Verify **Production Branch** is set to: `main`
3. NOT `master` or any other branch

**If wrong:**
- Change to `main`
- Save settings
- Push a new commit

---

### 3. **Ignored Build Step Enabled** ⚠️

**Symptoms:**
- Vercel receives webhook but skips build
- "Build skipped" message in logs

**Check in Vercel:**
1. Go to: **Settings** → **Git**
2. Look for **Ignored Build Step** setting
3. Check if it's enabled with a condition

**If enabled:**
- Disable it OR
- Modify condition to allow builds

---

### 4. **Deployment Paused** ⚠️

**Symptoms:**
- No deployments at all
- Project appears inactive

**Check in Vercel:**
1. Go to project overview
2. Look for "Deployments Paused" banner
3. Check project status

**If paused:**
- Click "Resume Deployments"

---

### 5. **GitHub App Permissions Issue** ⚠️

**Symptoms:**
- Vercel can't access repository
- Permission errors in logs

**Check:**
1. Go to: `https://github.com/settings/installations`
2. Find "Vercel" app
3. Verify `ghxstship/grasshopper26.00` is in allowed repos

**If not listed:**
- Add repository to Vercel app permissions
- Save changes

---

### 6. **Vercel Project Deleted/Disconnected** ⚠️

**Symptoms:**
- Project exists but isn't linked to repo
- No Git provider shown

**Check in Vercel:**
1. Go to project settings
2. Look for "Git Repository" section
3. Verify it shows: `ghxstship/grasshopper26.00`

**If disconnected:**
- Need to reconnect or recreate project

---

## 🔧 Step-by-Step Diagnostic

### Step 1: Verify GitHub Webhook

**Action:**
```
1. Go to: https://github.com/ghxstship/grasshopper26.00/settings/hooks
2. Find webhook with URL containing "vercel.com"
3. Click on it to see recent deliveries
```

**What to look for:**
- ✅ Green checkmark = Working
- ❌ Red X = Failed
- ⚠️ No webhook = Not connected

**If webhook exists but failing:**
- Check response codes
- Look for error messages
- May need to redeliver

---

### Step 2: Check Vercel Project Connection

**Action:**
```
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Git
4. Verify "Connected Git Repository" section
```

**What to look for:**
- Repository: `ghxstship/grasshopper26.00`
- Production Branch: `main`
- Status: Connected

**If disconnected:**
- Click "Disconnect" then "Connect Git Repository"
- Re-authorize if needed

---

### Step 3: Verify Production Branch

**Action:**
```
1. In Vercel Settings → Git
2. Find "Production Branch" setting
3. Confirm it's set to: main
```

**If it's set to `master` or something else:**
```
1. Change to: main
2. Save
3. Push a new commit
```

---

### Step 4: Check Ignored Build Step

**Action:**
```
1. In Vercel Settings → Git
2. Scroll to "Ignored Build Step"
3. Check if enabled
```

**If enabled with a command:**
```bash
# Common patterns that block builds:
git diff HEAD^ HEAD --quiet  # Blocks if no changes
exit 1                       # Always blocks
```

**Solution:**
- Disable "Ignored Build Step"
- OR change to: `exit 0` (always build)

---

### Step 5: Check Deployment History

**Action:**
```
1. Go to Vercel Dashboard → Deployments tab
2. Look for ANY deployments
3. Check timestamps
```

**What to look for:**
- No deployments ever = Connection issue
- Old deployments only = Trigger issue
- Failed deployments = Build/config issue

---

### Step 6: Manual Deploy Test

**Action:**
```
1. In Vercel Dashboard
2. Click "Deploy" button (top right)
3. Select branch: main
4. Click "Deploy"
```

**If manual deploy works:**
- ✅ Build configuration is correct
- ❌ Git integration is the problem

**If manual deploy fails:**
- ❌ Build configuration issue
- Check build logs for errors

---

## 🎯 Quick Fixes to Try

### Fix 1: Reconnect Git Integration

**In Vercel Dashboard:**
```
1. Settings → Git
2. Click "Disconnect" (if connected)
3. Click "Connect Git Repository"
4. Select GitHub
5. Choose: ghxstship/grasshopper26.00
6. Authorize
7. Set Production Branch to: main
8. Save
```

---

### Fix 2: Trigger Manual Deployment

**In Vercel Dashboard:**
```
1. Click "Deploy" button
2. Select "main" branch
3. Click "Deploy"
```

**This will:**
- ✅ Test if build works
- ✅ Verify environment variables
- ✅ Show any build errors

---

### Fix 3: Check GitHub App Permissions

**Steps:**
```
1. Go to: https://github.com/settings/installations
2. Find "Vercel" in the list
3. Click "Configure"
4. Under "Repository access":
   - Select "Only select repositories"
   - Add: ghxstship/grasshopper26.00
5. Save
```

---

### Fix 4: Create Deploy Hook (Workaround)

**If Git integration won't work:**

**In Vercel:**
```
1. Settings → Git → Deploy Hooks
2. Click "Create Hook"
3. Name: "Manual Deploy"
4. Branch: main
5. Copy the hook URL
```

**Then trigger manually:**
```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/..."
```

---

## 🔍 Environment Variables Check

**Required Variables in Vercel:**

### Critical (Must Have):
```
NEXT_PUBLIC_SUPABASE_URL=https://zunesxhsexrqjrroeass.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Important (Recommended):
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
CSRF_SECRET=<random-string>
CRON_SECRET=<random-string>
```

### Optional (For Features):
```
STRIPE_SECRET_KEY=<if using payments>
RESEND_API_KEY=<if using emails>
```

**To check in Vercel:**
```
1. Settings → Environment Variables
2. Verify all required variables exist
3. Check they're enabled for "Production"
```

---

## 📊 Diagnostic Checklist

Run through this checklist:

- [ ] GitHub webhook exists at `/settings/hooks`
- [ ] Webhook has green checkmark (successful deliveries)
- [ ] Vercel shows "Connected" to `ghxstship/grasshopper26.00`
- [ ] Production Branch is set to `main`
- [ ] Ignored Build Step is disabled OR set to `exit 0`
- [ ] GitHub App has access to repository
- [ ] Environment variables are configured
- [ ] No "Deployments Paused" message
- [ ] Manual deploy works
- [ ] Recent commits show in Vercel Git tab

---

## 🚨 If Nothing Works

### Nuclear Option: Recreate Project

**Steps:**
```
1. In Vercel, delete the current project
2. Create new project
3. Import from GitHub
4. Select: ghxstship/grasshopper26.00
5. Configure:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
6. Add environment variables
7. Deploy
```

**This will:**
- ✅ Reset all connections
- ✅ Create fresh webhooks
- ✅ Fix any corruption

---

## 📝 What to Check Right Now

### Immediate Actions:

1. **Check GitHub Webhooks:**
   - URL: `https://github.com/ghxstship/grasshopper26.00/settings/hooks`
   - Look for Vercel webhook
   - Check recent deliveries

2. **Check Vercel Git Settings:**
   - Verify connection status
   - Confirm production branch = `main`
   - Check ignored build step

3. **Try Manual Deploy:**
   - Click "Deploy" in Vercel
   - Select `main` branch
   - See if it works

4. **Check Deployment Logs:**
   - Go to Deployments tab
   - Look for any attempts
   - Check for error messages

---

## 🎯 Most Likely Issues

Based on symptoms, ranked by probability:

1. **Git integration not actually connected** (60%)
   - Webhook missing or broken
   - Need to reconnect

2. **Production branch mismatch** (20%)
   - Set to `master` instead of `main`
   - Easy fix in settings

3. **Ignored build step enabled** (15%)
   - Silently skipping builds
   - Disable or modify condition

4. **GitHub App permissions** (5%)
   - Vercel can't access repo
   - Fix in GitHub settings

---

## 📞 Next Steps

1. **Check GitHub webhook** (most important)
2. **Try manual deploy** (verify build works)
3. **Reconnect Git integration** (if webhook missing)
4. **Report back** with findings

---

**Created:** November 9, 2025, 6:35 PM EST  
**Status:** Awaiting diagnostic results  
**Priority:** HIGH - Blocking deployments
