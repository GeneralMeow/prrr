import moment from 'moment'
import knex from '../../server/knex'

import {
  insertUserFixture,
  insertPrrr,
  timeAgo,
} from '../helpers'

describe.only('Queries', function(){

  context('as Nico', function(){

    let queries

    beforeEach(function(){
      return insertUserFixture('nicosesma')
        .then(nico => {
          queries = new Queries(nico)
        })
    })

    describe('getPrrrs', function(){
      it('should resolve with all Prrrs', function(){
        return queries.getPrrrs()
          .then(prrrs => {
            expect(prrrs).to.be.an('object')
          })
      })
    })

  })

  describe('metricsForWeek', () => {

    let queries
    const week = '2017-01-09'

    beforeEach(() => {
      queries = new Queries

      return Promise.all([
        insertPrrr({
          id: 33,
          owner: 'anasauce',
          repo: 'prrr-so-meta',
          number: 45,
          requested_by: 'anasauce',
          claimed_by: 'deadlyicon',
          claimed_at:   moment('2017-01-09 11:52:08.244-08').toDate(),
          created_at:   moment('2017-01-09 09:52:08.244-08').toDate(),
          updated_at:   moment('2017-01-09 17:38:54.803-08').toDate(),
          completed_at: moment('2017-01-09 12:52:08.244-08').toDate(),
        }),
        insertPrrr({
          id: 34,
          owner: 'ykatz',
          repo: 'prrr-be-awesome',
          number: 35,
          requested_by: 'DianaVashti',
          claimed_by: 'peterparker',
          claimed_at:   moment('2017-01-09 11:52:08.244-08').toDate(),
          created_at:   moment('2017-01-09 09:52:08.244-08').toDate(),
          updated_at:   moment('2017-01-09 17:38:54.803-08').toDate(),
          completed_at: moment('2017-01-09 12:52:08.244-08').toDate(),
        }),
      ])
    })

    it('Week: should return the correct week', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.week).to.be.a('string')
          expect(results.week).to.eql('2017-01-09')
        })
    })

    it('Total Code Reviews: should return number of total code reviews', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.totalCodeReviews).to.be.a('number')
          expect(results.totalCodeReviews).to.eql(2)
        })
    })

    it('Total Code Reviews Per Reviewer: should return an object of key pair values', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.totalCodeReviewsPerReviewer).to.be.a('object')
          expect(results.totalCodeReviewsPerReviewer).to.eql({deadlyicon: 1, peterparker: 1})
        })
    })

    it('Average Time for Prrr to be Claimed: should return average time', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.averageTimeForPrrrToBeClaimed).to.be.a('number')
          expect(results.averageTimeForPrrrToBeClaimed).to.eql(7200000)
        })
    })

    it('Average Time for Prrr to be Completed: should return average time', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.averageTimeForPrrrToBeCompleted).to.be.a('number')
          expect(results.averageTimeForPrrrToBeCompleted).to.eql(3600000)
        })
    })

    it('Total Number of Project Reviews: should return total number', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.totalNumberOfProjectsThatRequestedReviews).to.be.a('number')
          expect(results.totalNumberOfProjectsThatRequestedReviews).to.eql(2)
        })
    })

    it('Average Number of Reviews Requested Per Project: should return average number', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.averageNumberOfReviewsRequestedPerProject).to.be.a('number')
          expect(results.averageNumberOfReviewsRequestedPerProject).to.eql(1)
        })
    })

    it('Prrrs: should resolve with all Prrs from a specific week', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.prrrs).to.be.an('array')
        })
    })

  })


  describe('getNextPendingPrrr', function(){

    let commandsAsNico, commandsAsPaul

    beforeEach(function(){
      return Promise.all([
        insertUserFixture('nicosesma'),
        insertUserFixture('paulirish'),
        insertUserFixture('GrahamCampbell'),
        insertPrrr({
          owner: 'GrahamCampbell',
          repo: 'Laravel-Parse',
          number: 22,
          requested_by: 'GrahamCampbell',
          created_at: timeAgo(60, 'minutes'),
          updated_at: timeAgo(60, 'minutes'),
        }),
        insertPrrr({
          owner: 'GrahamCampbell',
          repo: 'Sudoku',
          number: 8,
          requested_by: 'GrahamCampbell',
          created_at: timeAgo(50, 'minutes'),
          updated_at: timeAgo(50, 'minutes'),
        }),
        insertPrrr({
          owner: 'nicosesma',
          repo: 'core-algorithms',
          number: 8,
          requested_by: 'nicosesma',
          created_at: timeAgo(40, 'minutes'),
          updated_at: timeAgo(40, 'minutes'),
        }),
        insertPrrr({
          owner: 'nicosesma',
          repo: 'core-data-structures',
          number: 9,
          requested_by: 'nicosesma',
          created_at: timeAgo(30, 'minutes'),
          updated_at: timeAgo(30, 'minutes'),
        }),
        insertPrrr({
          owner: 'paulirish',
          repo: 'html5rocks',
          number: 4556,
          requested_by: 'paulirish',
          created_at: timeAgo(20, 'minutes'),
          updated_at: timeAgo(20, 'minutes'),
        }),
        insertPrrr({
          owner: 'paulirish',
          repo: 'gif-chrome-extension',
          number: 12,
          requested_by: 'paulirish',
          created_at: timeAgo(10, 'minutes'),
          updated_at: timeAgo(10, 'minutes'),
        }),
      ]).then(([nicosesma, paulirish, GrahamCampbell, ...prrrs]) => {
        commandsAsNico = new Commands(nicosesma)
        commandsAsPaul = new Commands(paulirish)
        expect(prrrs).to.have.length(6)
      })
    })

    it.only('should return the oldest unclaimed Prrr not requested by user', function(){
      let nicosPrrr, paulsPrrr

      return Promise.resolve()
        // Nico claims a Prrr
        .then(_ => commandsAsNico.claimPrrr())
        .then( prrr => {
          expect(prrr).to.not.be.null
          expect(prrr.owner).to.eql('GrahamCampbell')
          expect(prrr.repo).to.eql('Laravel-Parse')
          expect(prrr.number).to.eql(22)
          nicosPrrr = prrr
        })
        // Paul claims a Prrr
        .then(_ => commandsAsPaul.claimPrrr())
        .then( prrr => {
          expect(prrr).to.not.be.null
          expect(prrr.owner).to.eql('GrahamCampbell')
          expect(prrr.repo).to.eql('Sudoku')
          expect(prrr.number).to.eql(8)
          paulsPrrr = prrr
        })
        // Nico unclaims that Prrr
        .then(_ => commandsAsNico.unclaimPrrr(nicosPrrr.id))
        // Paul completes their prrr
        .then(_ => commandsAsPaul.completePrrr(paulsPrrr.id))
        // Nico claims another Prrr
        .then(_ => commandsAsNico.claimPrrr())
        .then( prrr => {
          expect(prrr.owner).to.eql('paulirish')
          expect(prrr.repo).to.eql('html5rocks')
          expect(prrr.number).to.eql(4556)
          nicosPrrr = prrr
        })
        // Paul claims another Prrr
        .then(_ => commandsAsPaul.claimPrrr())
        .then( prrr => {
          expect(prrr.owner).to.eql('GrahamCampbell')
          expect(prrr.repo).to.eql('Sudoku')
          expect(prrr.number).to.eql(8)
          paulsPrrr = prrr
        })


        // .then(_ => commandsAsPaul.claimPrrr())
        // .then( prrr => {
        //   expect(prrr.owner).to.eql('GrahamCampbell')
        //   expect(prrr.repo).to.eql('Sudoku')
        //   expect(prrr.number).to.eql(8)
        //   paulsPrrr = prrr
        // })
        // .then( prrr => {
        //   expect(prrr.owner).to.eql('paulirish')
        //   expect(prrr.repo).to.eql('gif-chrome-extension')
        //   expect(prrr.number).to.eql(12)
        // })




        // .then(_ => queries.getNextPendingPrrr())
        // .then( prrr => {
        //   expect(prrr.repo).to.eql('prrr-be-awesome')
        //   return markPullRequestAsClaimed(prrr)
        // })
        // .then(_ => queries.getNextPendingPrrr())
        // .then( prrr => {
        //   expect(prrr.repo).to.eql('prrr-rocks')
        //   return markPullRequestAsClaimed(prrr)
        // })
        // .then(_ => queries.getNextPendingPrrr())
        // .then( prrr => {
        //   expect(prrr).to.be.undefined
        // })
    })
  })
})
