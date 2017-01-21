import { emit } from './socket'

export const loadMetricsForWeek = (week) => {
  emit('loadMetricsForWeek', {week})
}

export const createPrrr = ({owner, repo, number}) => {
  emit('createPrrr', {owner, repo, number})
}

export const archivePrrr = (prrrId) => {
  emit('archivePrrr', {prrrId})
}

export const claimPrrr = () => {
  emit('claimPrrr')
}

export const unclaimPrrr = (prrrId) => {
  emit('unclaimPrrr', {prrrId})
}

export const completePrrr = (prrrId) => {
  emit('completePrrr', {prrrId})
}
