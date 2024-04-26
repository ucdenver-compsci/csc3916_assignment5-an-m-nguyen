let envPath = __dirname + "/../.env"
require('dotenv').config({path:envPath});
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let User = require('../users');
let Movie = require('../movies');
chai.should();

chai.use(chaiHttp);

let login_details = {
    name: 'test',
    username: 'email@email.com',
    password: 'abc@123'
}

let movie_details = {
    title: 'Monkey Man',
    releaseDate: 2024,
    genre: 'Action',
    actors: [ { actorName: 'Dev Patel', characterName: 'Kid' }, { actorName: 'Sobhita Dhulipala', characterName: 'Sita' }, { actorName: 'Sikandar Kher', characterName: 'Rana' } ]
}

let token = ''

describe('Test Movie Routes', () => {
   before((done) => { //Before  test initialize the database to empty
        User.deleteOne({ name: 'test'}, function(err, user) {
            if (err) throw err;
        });

        Movie.deleteOne({ title: 'Monkey Man'}, function(err, user) {
            if (err) throw err;
        });
       done();
    })

    after((done) => { //after this test suite empty the database
        User.deleteOne({ name: 'test'}, function(err, user) {
            if (err) throw err;
        });

        Movie.deleteOne({ title: 'Monkey Man'}, function(err, user) {
            if (err) throw err;
        });
        done();
    })

    describe('/signup', () => {
        it('it should register, login and check our token', (done) => {
          chai.request(server)
              .post('/signup')
              .send(login_details)
              .end((err, res) =>{
                res.should.have.status(200);
                res.body.success.should.be.eql(true);
                //follow-up to get the JWT token
                chai.request(server)
                    .post('/signin')
                    .send(login_details)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('token');
                        token = res.body.token;
                        done();
                    })
              })
        })
    });

    //Test the POST route
    describe('POST Movies', () => {
        it('it return all movies', (done) => {
            chai.request(server)
                .post('/movies')
                .set('Authorization', token)
                .send(movie_details)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
    });

    //Test the GET route
    describe('GET Movies', () => {
        it('it return all movies', (done) => {
            chai.request(server)
                .get('/movies')
                .set('Authorization', token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.forEach(movie => {
                        movie.should.have.property('title')
                        movie.should.have.property('releaseDate')
                        movie.should.have.property('genre')
                        movie.should.have.property('actors')
                    });
                    done();
                })
        })
    });
});