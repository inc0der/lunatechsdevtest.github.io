<template>
  <div class="theme-container">
    <div v-show="formSubmitted">
      <p>
        Your bug has been succesfully reported
      </p>
    </div>
    <form v-show="!formSubmitted">
      <div class="warning">
        <b>Important!</b>
        <ul>
          <li>Please fill in as much as possible, else, the bug report may be deleted without notice.</li>
          <li>This bug report will be publicly available so do not share sensitive information.</li>
        </ul>
      </div>
      <label for="title" ref="title">
        Title
        <small class="required">
          <b>*</b>
        </small>
      </label>
      <input v-model="title" type="text" name="title" placeholder="Title" />

      <div class="grid">
        <div class="grid-half">
          <label for="plugin">
            Plugin
            <small class="required">
              <b>*</b>
            </small>
          </label>
          <select v-model="selectedPluginId" name="plugin">
            <option v-for="plugin in plugins" :value="plugin.id">
              {{
              plugin.name
              }}
            </option>
          </select>
        </div>

        <div class="grid-half">
          <label for="os">Operating System/Enviorment</label>
          <select name="os" v-model="os">
            <option>🏁 Windows</option>
            <option>🌐 Browser</option>
            <option>🍎 Mac OSX</option>
            <option>🐧 Linux</option>
          </select>
        </div>
      </div>

      <div class="grid">
        <div class="grid-half">
          <label for="subject">
            Where does the bug occur
            <small class="required">
              <b>*</b>
            </small>
          </label>
          <select v-model="bugLocation" name="bugLocation">
            <option v-for="location in bugLocations" :value="location.toLowerCase()">
              {{
              location
              }}
            </option>
          </select>
          <input
            v-if="bugLocation === 'other'"
            v-model="bugLocationOther"
            type="text"
            placeholder="Please specify..."
          />
        </div>

        <div class="grid-half">
          <label for="subject">
            Action before bug occurs
            <small class="required">
              <b>*</b>
            </small>
          </label>
          <select v-model="bugAction" name="plugin">
            <option v-for="action in bugActions" :value="action.toLowerCase()">
              {{
              action
              }}
            </option>
          </select>
          <input
            v-if="bugAction === 'other'"
            v-model="bugActionOther"
            type="text"
            placeholder="Please specify..."
          />
        </div>
      </div>

      <label for="subject">
        Problem Description
        <small class="required">
          <b>*</b>
        </small>
      </label>
      <textarea
        v-model="description"
        name="subject"
        placeholder="Provide a short description of your problem"
        style="min-height: 100px;"
      ></textarea>

      <div class="grid">
        <div class="grid-half">
          <label for="subject">Expected Behaviour</label>
          <textarea
            v-model="expectedBehaviour"
            placeholder="What is the expected behaviour"
            style="min-height: 100px;"
          ></textarea>
        </div>

        <div class="grid-half">
          <label for="actualBehaviour">Actual Behaviour</label>
          <textarea
            name="actualBehaviour"
            v-model="actualBehaviour"
            placeholder="Write something.."
            style="min-height: 100px;"
          ></textarea>
        </div>
      </div>

      <label for="stepsToReproduce">Steps to Reproduce</label>
      <textarea
        name="stepsToReproduce"
        v-model="stepsToReproduce"
        placeholder="What are the neccesary steps to reproduce the bug"
        style="min-height: 100px;"
      ></textarea>

      <label for="offendingCode">Offending Code</label>
      <textarea
        v-model="offendingCode"
        name="offendingCode"
        placeholder="Could you provide what you beleive is the offending code?"
        style="min-height: 100px;"
      ></textarea>

      <div class="grid">
        <div class="grid-half">
          <label for="gameDemoLink">
            Link to Demo Game
            <small class="required">
              <b>*</b>
            </small>
          </label>
          <input
            v-model="gameDemoLink"
            name="gameDemoLink"
            type="url"
            ref="gameDemoLink"
            placeholder="A Google Drive, Dropbox, etc, link to your demo game"
          />
        </div>
      </div>
      <p v-show="errors.length">
        <b>Please correct the following error(s):</b>
      </p>
      <ul>
        <li v-for="error in errors">{{ error }}</li>
      </ul>
      <div id="h-captcha"></div>
    </form>

    <input
      v-show="!formSubmitted"
      :class="{ disabled: isProcessing }"
      id="submit"
      type="submit"
      value="Submit"
      @click="submitReport"
    />

    <div v-show="canShowLoader()" class="loader"></div>

    <input
      v-show="formSubmitted"
      id="retry"
      type="submit"
      value="Report Another Bug"
      @click="resetForm"
    />
  </div>
</template>

<script>
const SITE_KEY = 'e51b1a3d-0744-4838-8711-e12acab1a02a-S0ino7o'
const DEV_API_URL = 'http://localhost:5000/api'
const API_URL = 'https://api.lunatechs.dev/'

async function timeout (time) {
  return new Promise(resolve => setTimeout(() => { resolve() }, time))
}

function filterGitProjects (projects) {
  return projects.map(project => {
    const pluginKeyMatch = [...project.description.matchAll(/`(.*)`/g)]
    const matches = pluginKeyMatch[0]

    if (matches && matches.length > 0) {
      return {
        gitSlug: project.name,
        name: matches[1],
        url: project.url,
        id: project.id
      }
    }
  })
  .filter(plugin => plugin)
}

export default {
  data () {
    return {
      formSubmitted: false,
      plugins: [],
      title: '',
      selectedPluginId: '',
      os: '🏁 Windows 10',
      bugLocations: ['Game Map', 'Battle Scene', 'Menu', 'Other'],
      bugLocation: '',
      bugLocationOther: '',
      bugActions: ['Moving', 'Processing an Event', 'Opening Menu', 'Switching Scenes', 'Other'],
      bugAction: '',
      bugActionOther: '',
      description: '',
      expectedBehaviour: '',
      actualBehaviour: '',
      stepsToReproduce: '',
      offendingCode: '',
      gameDemoLink: '',
      errors: [],
      captchaUserToken: '',
      issueLink: '',
      isProcessing: false
    }
  },

  methods: {
    canShowLoader () {
      return this.isProcessing && !this.formSubmitted
    },

    onCaptchaExpire () {
      this.errors.push('Captcha expired')
    },

    async onCaptchaFullfilled (token) {
      this.captchaUserToken = token
    },

    async validateCapctha () {
      try {
        const apiString = `${API_URL}/verifyCaptcha`
        const data = await fetch(`${apiString}?token=${this.captchaUserToken}`)

        return data
      } catch (error) {
        const message = 'Error verifying captcha with server, contact website administrator'
        console.error(message, error)
      }
    },

    async validateForm () {
      /* eslint-disable dot-notation */
      this.errors = []

      if (!this.title) {
        this.errors.push('A Title is required')
      }

      if (!this.selectedPluginId) {
        this.errors.push('The affected plugin is required')
      }

      if (!this.bugLocation && this.bugLocationOther) {
        this.errors.push('The location of the bug is required')
      }

      if (!this.bugAction && this.bugLocationOther) {
        this.errors.push('The action before bug is required')
      }

      if (!this.description) {
        this.errors.push('A description is required')
      }

      if (!this.gameDemoLink) {
        this.errors.push('A link to a demo game is required')
      }

      if (!this.$refs['gameDemoLink'].checkValidity()) {
        this.errors.push('Invalid URL for the game demo link')
      }

      if (!this.captchaUserToken) {
        this.errors.push('You need to complete the reCaptcha')
      }

      if (this.errors.length > 0) {
        return false
      }

      // We don't attempt captcha validation until errors are solved above. This will ensure we perform less server calls.
      const validationRequest = await this.validateCapctha()
      const isValidated = await validationRequest.text() === 'true'

      if (!isValidated) {
        this.errors.push('reCaptcha was unable to determine if you\'re a human, please try again.')
        return false
      }
      return true
    },

    async submitReport () {
      this.isProcessing = true
      const isValid = await this.validateForm()

      if (isValid) {
        const content = `
**Location bug occurs:** ${this.bugLocation !== 'other' ? this.bugLocation : this.bugLocationOther}\n
**Action performed before bug:** ${this.bugAction !== 'other' ? this.bugAction : this.bugActionOther}\n
# Description
${this.description}

## Expected Behaviour
${this.expectedBehaviour}

## Actual Behaviour
${this.actualBehaviour}

## Steps to Reproduce
${this.stepsToReproduce}

## Possible Offending Code
${this.offendingCode}

**Demo Game Link:** ${this.gameDemoLink}
`

        const data = {
          title: this.title,
          labels: ['🐛 bug', '📃 Website Report', this.os],
          content
        }

        const response = await fetch(`${API_URL}/reportBug`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data,
            selectedPluginId: this.selectedPluginId
          })
        })

        if (response.ok) {
          this.formSubmitted = true
          this.isProcessing = false
          this.issueLink = response.web_url
          return
        }
        this.errors.push('Unable to submit report')
        console.error(response)
      }
      await timeout(1600) // We wait before allowing user to re-validate too quickly
      this.isProcessing = false
    },

    resetForm () {
      Object.assign(this.$data, this.$options.data.apply(this))
      window.hcaptcha.reset()
    }
  },

  async mounted () {
     if (localStorage.plugins) {
      this.plugins = JSON.parse(localStorage.paidPlugins)
      return
    }
    const gitResponse = await fetch(`${DEV_API_URL}/fetchGitProjects`)
    const projectData = await gitResponse.json()
    const plugins = filterGitProjects(projectData)
    
    this.plugins = plugins
    localStorage.plugins = JSON.stringify(plugins)

    const hcaptcha = window.hcaptcha
    const captchaElement = document.getElementById('h-captcha')

    hcaptcha.render(captchaElement, {
      sitekey: SITE_KEY,
      theme: 'dark',
      callback: (d) => this.onCaptchaFullfilled(d),
      'expired-callback': this.onCaptchaExpire,
      'error-callback': (err) => console.error(err)
    })
  }
}
</script>

<style lang="stylus">
small.required {
  color: red;
}

input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid black;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 6px;
  margin-bottom: 16px;
  resize: vertical;
  background-color: #262424;
  color: white;
}

input[type='submit'] {
  background-color: $accentColor;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 1rem 0 1rem 0;
  max-width: 10rem;
}

input[type='submit']:hover {
  background-color: darken($accentColor, 15%);
}

input[type='submit'].disabled {
  background-color: #b5b5b5;
  cursor: not-allowed;
}

.warning {
  margin: 2rem;
  border-left: 5px solid $badgeWarningColor;
  padding-left: 1rem;
  color: $textColor;
}

.grid {
  display: flex;
}

.grid-half {
  width: 50%;
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
  position: relative;
}

.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #ff8040; /* Blue */
  border-radius: 50%;
  width: 16px;
  height: 16px;
  margin-left: 2rem;
  animation: spin 2s linear infinite;
  display: inline-block
  vertical-align: middle
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
