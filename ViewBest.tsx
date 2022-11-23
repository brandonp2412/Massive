import {RouteProp, useRoute} from '@react-navigation/native'
import {format} from 'date-fns'
import {useEffect, useMemo, useState} from 'react'
import {View} from 'react-native'
import {List, Text} from 'react-native-paper'
import {BestPageParams} from './BestPage'
import Chart from './Chart'
import {PADDING} from './constants'
import {setRepo} from './db'
import GymSet from './gym-set'
import {Metrics} from './metrics'
import {Periods} from './periods'
import Select from './Select'
import StackHeader from './StackHeader'
import Volume from './volume'

export default function ViewBest() {
  const {params} = useRoute<RouteProp<BestPageParams, 'ViewBest'>>()
  const [weights, setWeights] = useState<GymSet[]>([])
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [metric, setMetric] = useState(Metrics.Weight)
  const [period, setPeriod] = useState(Periods.Monthly)

  useEffect(() => {
    console.log(`${ViewBest.name}.useEffect`, {metric})
    console.log(`${ViewBest.name}.useEffect`, {period})
    let difference = '-7 days'
    if (period === Periods.Monthly) difference = '-1 months'
    else if (period === Periods.Yearly) difference = '-1 years'
    let group = '%Y-%m-%d'
    if (period === Periods.Yearly) group = '%Y-%m'
    const builder = setRepo
      .createQueryBuilder()
      .select("STRFTIME('%Y-%m-%d', created)", 'created')
      .addSelect('unit')
      .where('name = :name', {name: params.best.name})
      .andWhere('NOT hidden')
      .andWhere("DATE(created) >= DATE('now', 'weekday 0', :difference)", {
        difference,
      })
      .groupBy('name')
      .addGroupBy(`STRFTIME('${group}', created)`)
    switch (metric) {
      case Metrics.Weight:
        builder.addSelect('MAX(weight)', 'weight').getRawMany().then(setWeights)
        break
      case Metrics.Volume:
        builder
          .addSelect('SUM(weight * reps)', 'value')
          .getRawMany()
          .then(setVolumes)
        break
      default:
        // Brzycki formula https://en.wikipedia.org/wiki/One-repetition_maximum#Brzycki
        builder
          .addSelect('MAX(weight / (1.0278 - 0.0278 * reps))', 'weight')
          .getRawMany()
          .then(newWeights => {
            console.log({weights: newWeights})
            setWeights(newWeights)
          })
    }
  }, [params.best.name, metric, period])

  const charts = useMemo(() => {
    if (
      (metric === Metrics.Volume && volumes.length === 0) ||
      (metric === Metrics.Weight && weights.length === 0) ||
      (metric === Metrics.OneRepMax && weights.length === 0)
    )
      return <List.Item title="No data yet." />
    if (metric === Metrics.Volume)
      return (
        <Chart
          yData={volumes.map(v => v.value)}
          yFormat={(value: number) =>
            `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
              volumes[0].unit || 'kg'
            }`
          }
          xData={weights}
          xFormat={(_value, index) =>
            format(new Date(weights[index].created), 'd/M')
          }
        />
      )

    return (
      <Chart
        yData={weights.map(set => set.weight)}
        yFormat={value => `${value}${weights[0].unit}`}
        xData={weights}
        xFormat={(_value, index) =>
          format(new Date(weights[index].created), 'd/M')
        }
      />
    )
  }, [volumes, weights, metric])

  return (
    <>
      <StackHeader title={params.best.name} />
      <View style={{padding: PADDING}}>
        <Select
          items={[
            {value: Metrics.Volume, label: Metrics.Volume},
            {value: Metrics.OneRepMax, label: Metrics.OneRepMax},
            {
              label: Metrics.Weight,
              value: Metrics.Weight,
            },
          ]}
          onChange={value => setMetric(value as Metrics)}
          value={metric}
        />
        <Select
          items={[
            {value: Periods.Weekly, label: Periods.Weekly},
            {value: Periods.Monthly, label: Periods.Monthly},
            {value: Periods.Yearly, label: Periods.Yearly},
          ]}
          onChange={value => setPeriod(value as Periods)}
          value={period}
        />
        {charts}
      </View>
    </>
  )
}
