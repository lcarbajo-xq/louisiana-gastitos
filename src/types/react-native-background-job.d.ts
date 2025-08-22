declare module 'react-native-background-job' {
  interface BackgroundJobOptions {
    jobKey: string
    period?: number
    taskName?: string
  }

  interface BackgroundJobCancelOptions {
    jobKey: string
  }

  const BackgroundJob: {
    start: (options: BackgroundJobOptions) => void
    cancel: (options: BackgroundJobCancelOptions) => void
    stop: (options: BackgroundJobCancelOptions) => void
  }

  export default BackgroundJob
}
