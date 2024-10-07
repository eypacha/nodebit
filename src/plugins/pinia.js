import { useStudioStore } from "@/stores/studio"

export default {
  install: (app) => {
    app.config.globalProperties.$studio = useStudioStore()
  }
}