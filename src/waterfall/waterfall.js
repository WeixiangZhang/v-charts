import { getFormated } from '../util'

const dataHandler = {
  getWaterfallTooltip (dataType) {
    return {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter (items) {
        const item = items[1]
        return [
          `${item.name}<br/>${item.seriesName} :`,
          `${getFormated(item.value, dataType)}`
        ].join('')
      }
    }
  },

  getWaterfallXAxis ({ dimension, rows, remainStatus, totalName, remainName, xAxisName }) {
    let xAxisData = [totalName].concat(rows.map(row => row[dimension]))
    if (remainStatus === 'have-remain') xAxisData = xAxisData.concat([remainName])

    return {
      type: 'category',
      name: xAxisName,
      splitLine: { show: false },
      data: xAxisData
    }
  },

  getWaterfallYAxis ({ dataType, yAxisName }) {
    return {
      type: 'value',
      name: yAxisName,
      axisTick: { show: false },
      axisLabel: {
        formatter (val) {
          return getFormated(val, dataType)
        }
      }
    }
  },

  getWaterfallSeries ({ dataType, rows, dimension, measure, totalNum, remainStatus, dataSum }) {
    const seriesBase = { type: 'bar', stack: '总量' }
    let dataSumTemp = dataSum
    let totalNumTemp = totalNum
    let assistData
    let mainData
    const rowData = rows.map(row => row[measure])

    if (remainStatus === 'have-remain') {
      assistData = [0].concat(rows.map(row => {
        totalNumTemp -= row[measure]
        return totalNumTemp
      })).concat([0])
      mainData = [totalNum].concat(rowData).concat([totalNum - dataSum])
    } else {
      assistData = [0].concat(rows.map(row => {
        dataSumTemp -= row[measure]
        return dataSumTemp
      }))
      mainData = [dataSum].concat(rowData)
    }
    const series = []

    series.push(Object.assign({
      name: '辅助',
      itemStyle: {
        normal: { opacity: 0 },
        emphasis: { opacity: 0 }
      },
      data: assistData
    }, seriesBase))

    series.push(Object.assign({
      name: '数值',
      label: {
        normal: {
          show: true,
          position: 'top',
          formatter (item) {
            return getFormated(item.value, dataType)
          }
        }
      },
      data: mainData
    }, seriesBase))
    return series
  },

  getWaterfallRemainStatus ({ dataSum, totalNum }) {
    if (!totalNum) return 'not-total'
    return totalNum > dataSum ? 'have-remain' : 'none-remain'
  }
}

const waterfall = (columns, rows, settings) => {
  const {
    dataType = 'normal',
    dimension = columns[0],
    totalName = '总计',
    totalNum,
    remainName = '其他',
    xAxisName = dimension
  } = settings
  let measureTemp = columns.slice()
  measureTemp.splice(measureTemp.indexOf(dimension), 1)
  const measure = measureTemp[0]
  const yAxisName = measure
  const tooltip = dataHandler.getWaterfallTooltip(dataType)
  const dataSum = rows.reduce((pre, cur) => pre + Number(cur[measure]), 0).toFixed(2)
  const remainStatus = dataHandler.getWaterfallRemainStatus({ dataSum, dimension, totalNum })
  const xAxis = dataHandler.getWaterfallXAxis({ dimension, rows, remainStatus, totalName, remainName, xAxisName })
  const yAxis = dataHandler.getWaterfallYAxis({ dataType, yAxisName })
  const series = dataHandler.getWaterfallSeries({ dataType, rows, dimension, measure, totalNum, remainStatus, dataSum })
  const options = { tooltip, xAxis, yAxis, series }
  return options
}

export { waterfall }
