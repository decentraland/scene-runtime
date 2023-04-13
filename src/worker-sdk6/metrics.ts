import { DevToolsAdapter } from "./runtime/DevToolsAdapter"

type MetricEntry = {
    dtUpdate: number
    dtSendBatch: number
    dtTick: number
    dtAll: number
    messagesCount: number
    totalJsonLength: number
}

const units: Record<keyof MetricEntry, string> = {
    dtUpdate: 'ms',
    dtSendBatch: 'ms',
    dtTick: 'ms',
    dtAll: 'ms',
    messagesCount: 'msgs',
    totalJsonLength: 'bytes'
}

const MetricEntryEmpty = (): MetricEntry =>({
    dtUpdate: 0,
    dtSendBatch: 0,
    dtTick: 0,
    dtAll: 0,
    messagesCount: 0,
    totalJsonLength: 0
} )

// how many frames collects before report them
const METRICS_LENGTH = 1000 
const metricsData: MetricEntry[] = Array.from({ length: METRICS_LENGTH}, MetricEntryEmpty)
let m = 0
  
/**
 * 
 * @param t0 - when tick begins
 * @param t1 - after updates function were called
 * @param t2 - after sending and before reschedule
 */
export function addMetricData(t0: number, t1: number, t2: number, dt: number, messagesCount: number, totalJsonLength: number) {
    metricsData[m].dtUpdate = t1 - t0
    metricsData[m].dtSendBatch = t2 - t1
    metricsData[m].dtTick = dt
    metricsData[m].dtAll = t2 - t0
    metricsData[m].messagesCount = messagesCount
    metricsData[m].totalJsonLength = totalJsonLength

    m++
    if (m >= METRICS_LENGTH) {
        m = 0
        return true
    } 

    return false
}

export function reportMetrics(devToolsAdapter: DevToolsAdapter) {
    const zero = MetricEntryEmpty()
    const N = metricsData.length
    const sum = metricsData.reduce((prev, cur) => {
        for (const key in zero) {
            prev[key as keyof MetricEntry] += cur[key as keyof MetricEntry]
        }
        return prev
    }, MetricEntryEmpty())

    const mean = MetricEntryEmpty()
    for (const key in zero) {
        mean[key as keyof MetricEntry] += sum[key as keyof MetricEntry] / N
    }

    const sum2dev = metricsData.reduce((prev, cur) => {
        for (const key in zero) {
            const diff = (cur[key as keyof MetricEntry] - mean[key as keyof MetricEntry])
            prev[key as keyof MetricEntry] += diff * diff
        }
        return prev
    }, MetricEntryEmpty())

    const std_desviation = MetricEntryEmpty()
    for (const key in zero) {
        std_desviation[key as keyof MetricEntry] = Math.sqrt(sum2dev[key as keyof MetricEntry] / N)
    }

    let metric: string[] = []
    for (const key in zero) {
        metric.push(
            `${key}=${
            mean[key as keyof MetricEntry].toFixed(4)}±${
            std_desviation[key as keyof MetricEntry].toFixed(4)}[${
            units[key as keyof MetricEntry]}]`)
    }

    devToolsAdapter.log(`Scene Metrics report: ${metric.join(' ; ')}`)
}