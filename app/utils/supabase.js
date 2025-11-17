import { watch } from 'vue'

export function waitForCurrentUserProfile () {
    const state = useState('currentUserProfile')

    if (state.value) return Promise.resolve(state.value)

    return new Promise((resolve) => {
        const stop = watch(state, (v) => {
            if (v) {
                stop()
                resolve(v)
            }
        })
    })
}