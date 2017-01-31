import io from 'socket.io-client'
import {
  SERVER_PORT,
  withServer,
  insertUser,
  insertPrrr,
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
      nicosesma = JSON.parse(JSON.stringify(records[0]))
      GrahamCampbell = JSON.parse(JSON.stringify(records[1]))
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
        .then(_ => wait(1000))
        .then(_ => {
          console.log(JSON.stringify(eventLog, null, 4))
          expect(eventLog).to.have.length(1)
        })

    })

  })
})
