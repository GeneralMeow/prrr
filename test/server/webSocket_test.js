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
            payload: { user: nicosesma }
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
        })

    })

  })
})
