import moment from 'moment'
import {
  insertUser,
} from './helpers'

export function insertUserFixture(name){
  if (name === 'nicosesma') {
    return insertUser({
      name: 'Nico',
      email: 'nicosm310@gmail.com',
      avatar_url: 'https://avatars0.githubusercontent.com/u/18688343?v=3&s=460',
      github_id: 987654,
      github_username: 'nicosesma',
      github_access_token: 'FAKE_GITHUB_ACCESS_TOKEN'+name,
      github_refresh_token: null,
      created_at: moment('2016-11-01').toDate(),
      updated_at: moment('2016-11-01').toDate(),
    })
  }
  if (name === 'GrahamCampbell') {
    return insertUser({
      name: 'Graham Campbell',
      email: 'graham@alt-three.com',
      avatar_url: 'https://avatars1.githubusercontent.com/u/2829600?v=3&s=460',
      github_id: 123456,
      github_username: 'GrahamCampbell',
      github_access_token: 'FAKE_GITHUB_ACCESS_TOKEN'+name,
      github_refresh_token: null,
      created_at: moment('2012-01-01').toDate(),
      updated_at: moment('2012-01-01').toDate(),
    })
  }
  if (name === 'paulirish') {
    return insertUser({
      name: 'Paul Irish',
      email: 'paul@paulirish.com',
      avatar_url: 'https://avatars2.githubusercontent.com/u/39191?v=3&s=460',
      github_id: 56588,
      github_username: 'paulirish',
      github_access_token: 'FAKE_GITHUB_ACCESS_TOKEN'+name,
      github_refresh_token: null,
      created_at: moment('2011-01-01').toDate(),
      updated_at: moment('2011-01-01').toDate(),
    })
  }
  throw new Error(`unknown user fixture "${name}"`)
}
