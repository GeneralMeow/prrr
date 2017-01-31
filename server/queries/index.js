import knex from '../knex'
import moment from 'moment'
import Github from '../Github'
import Metrics from './metrics'

export default class Queries {

  constructor(currentUser, _knex=knex){
    this.currentUser = currentUser
    this.knex = _knex
    if (this.currentUser)
      this.github = new Github(this.currentUser.github_access_token)
  }

  getUserByGithubId(githubId){
    return this.knex
      .select('*')
      .from('users')
      .where('github_id', githubId)
      .first()
  }

  getUserByGithubUsername(githubUsername){
    return this.knex
      .select('*')
      .from('users')
      .where('github_username', githubUsername)
      .first()
  }

  getAllPrrrs(){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .then(convertArrayOfPrrrsIntoHashById)
  }

  getPrrrs(){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .orderBy('created_at', 'desc')
      .where({
        archived_at: null,
        claimed_at: null,
        claimed_by: null,
        completed_at: null,
      })
      .orWhere({
        requested_by: this.currentUser.github_username,
      })
      .orWhere({
        claimed_by: this.currentUser.github_username,
      })
      .then(convertArrayOfPrrrsIntoHashById)
  }

  getNextPendingPrrr(){

    `
      select *
      from "pull_request_review_requests"
      WHERE "pull_request_review_requests"."claimed_at" IS NULL
      AND NOT "pull_request_review_requests"."id" IN (
        select prrr_id from "unclaimed_prrrs" WHERE "github_username" = 'deadlyicon'
      )
    `

    const x = this.knex
      .select('*')
      .from('pull_request_review_requests')
      .join('unclaimed_prrrs', 'pull_request_review_requests.id', '=', 'unclaimed_prrrs.prrr_id')
      .whereNot('unclaimed_prrrs.github_username', this.currentUser.github_username)
      .whereNot('requested_by', this.currentUser.github_username)
      .where({
        archived_at: null,
        completed_at: null,
        claimed_by: null,
        claimed_at: null,
      })
      .orderBy('created_at', 'asc')
      .first()

    console.log('XXXXXX', x+'')
    return x
  }

  getPrrrById(prrrId){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .where('id', prrrId)
      .first()
  }

  getPrrrForPullRequest(pullRequest){
    return this.knex
      .select('*')
      .from('pull_request_review_requests')
      .where({
        owner: pullRequest.base.repo.owner.login,
        repo: pullRequest.base.repo.name,
        number: pullRequest.number,
      })
      .first()
  }

  getPullRequest({owner, repo, number}){
    return this.github.pullRequests.get({owner, repo, number})
  }

  getRequestorForPrrr(prrr){
    return knex
      .select('*')
      .from('users')
      .where('github_username', prrr.requested_by)
      .first()
  }

  metricsForWeek(week){
    return new Metrics({week, queries: this}).load()
  }
}

const convertArrayOfPrrrsIntoHashById = prrrs =>
  prrrs.reduce((prrrs, prrr) => {
    prrrs[prrr.id] = prrr
    return prrrs
  }, {})
