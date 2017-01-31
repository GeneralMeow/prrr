import io from 'socket.io-client'
import {
  SERVER_PORT,
  withServer,
  insertUser,
  insertPrrr,
  jsonify,
} from '../helpers'

import { insertUserFixture } from '../fixtures'

const wait = (milliseconds, block) => {
  return new Promise((resolve, reject) => {
    setTimeout(_ => { resolve() }, milliseconds)
  })
}

describe.only('WebSocket', function(){

  let nicosesma, GrahamCampbell

  beforeEach(function(){
    return Promise.all([
      insertUserFixture('nicosesma'),
      insertUserFixture('GrahamCampbell'),
    ]).then(records => {
      nicosesma = jsonify(records[0])
      GrahamCampbell = jsonify(records[1])
    })
  })

  withServer(function(){
    it('should work', function(){
      this.timeout(5000)

      const RECEIVABLE_EVENTS = [
        'connect',
        'errorOccured',
        'updateSession',
        'initialPrrrs',
        'metricsForWeek',
        'initialPrrrs',
        'PrrrClaimed',
        'PrrrUpdated',
      ]

      const eventLog = []

      const expectEvent = event =>
        expect(eventLog).to.deep.include(event)

      const clearEventLog = _ => eventLog.length = 0

      const client0 = io.connect(`http://0.0.0.0:${SERVER_PORT}`, {
        forceNew: true,
        query: {loggedInAs: nicosesma.github_id}
      });

      const client1 = io.connect(`http://0.0.0.0:${SERVER_PORT}`, {
        forceNew: true,
        query: {loggedInAs: GrahamCampbell.github_id}
      });

      // listen for all events on both clients and push them onto a log
      [client0, client1].forEach((client, index) => {
        RECEIVABLE_EVENTS.forEach(event => {
          client.on(event, payload => {
            eventLog.push({client: index, event, payload})
          })
        })
      })

      return wait(1000)
        .then(_ => {
          expectEvent({
            client: 0,
            event: 'connect',
            payload: undefined,
          })
          expectEvent({
            client: 0,
            event: 'updateSession',
            payload: { user: nicosesma },
          })
          expectEvent({
            client: 0,
            event: 'initialPrrrs',
            payload: { },
          })
          expectEvent({
            client: 1,
            event: 'connect',
            payload: undefined,
          })
          expectEvent({
            client: 1,
            event: 'updateSession',
            payload: { user: GrahamCampbell }
          })
          expectEvent({
            client: 1,
            event: 'initialPrrrs',
            payload: { },
          })
          expect(eventLog).to.have.length(8)
          clearEventLog()
        })
        .then(_ => {
          sinon.stub(Queries.prototype, "getPullRequest")
            .returns(Promise.resolve({FAKE_PR: true}))

          client0.emit('createPrrr', {
            owner: 'nicosesma',
            repo: 'go-game',
            number: 14,
          })
        })
        .then(_ => wait(100))
        .then(_ => knex.select('*').from('pull_request_review_requests'))
        .then(prrrs => {
          expect(prrrs).to.have.length(1)
          const prrr = jsonify(prrrs[0])
          expectEvent({
            client: 0,
            event: 'PrrrUpdated',
            payload: prrr,
          })
          expectEvent({
            client: 1,
            event: 'PrrrUpdated',
            payload: prrr,
          })
          expect(eventLog).to.have.length(2)
        })

    })

  })
})
