describe('In ASSETS module', function() {
    describe('when getting an asset', function() {

        describe('while using a non-authorized user', function() {

            var corbelDriver;

            before(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_USER'].clone();
                corbelTest.common.clients.loginUser(
                    corbelDriver, 
                    corbelDriver.config.get('username'), corbelDriver.config.get('password')
                )
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('asset is not retrieved due to authorization reasons', function(done) {
                corbelDriver.assets().getAll()
                .should.eventually.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 401);
                    expect(e).to.have.deep.property('data.error', 'unauthorized');
                })
                .should.notify(done);
            });
        });

        describe('while using an admin user', function() {

            var corbelDriver;

            before(function(done) {
                corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
                corbelTest.common.clients.loginUser(
                    corbelDriver, 
                    corbelDriver.config.get('username'), corbelDriver.config.get('password')
                )
                .should.be.eventually.fulfilled.and.notify(done);
            });

            it('assets are correctly retrieved with no params defined', function(done) {
                corbelDriver.assets().getAll()
                .should.eventually.be.fulfilled.and.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to 1 at page 0', function(done) {
                corbelDriver.assets().getAll({
                    query: [{
                        'name': 'assettest50'
                    }],
                    pagination: {
                        page: 0,
                        pageSize: 1
                    }
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 1);
                })
                .should.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to 15 at page 1', function(done) {
                corbelDriver.assets().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 1,
                        pageSize: 15
                    }
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 15);
                })
                .should.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to 6 at page 2', function(done) {
                corbelDriver.assets().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 2,
                        pageSize: 6
                    }
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 6);
                })
                .should.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to 50 at page 0', function(done) {
                corbelDriver.assets().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 0,
                        pageSize: 50
                    }
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 50);
                })
                .should.notify(done);
            });

            it('no assets are returned when trying to fech an invalid page', function(done) {
                corbelDriver.assets().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 4,
                        pageSize: 50
                    }
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('server replies with an error when pageSize is set to 100', function(done) {
                corbelDriver.assets().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 0,
                        pageSize: 100
                    }
                })
                .should.eventually.be.rejected
                .then(function(e) {
                    expect(e).to.have.deep.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_page_size');
                })
                .should.notify(done);
            });

            it('filtered assets are retrieved when queryParams filters by scope', function(done) {
                corbelDriver.assets().getAll({
                    query: [{
                        '$in': {
                            'scopes': ['assets:asset']
                        }
                    }]
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    response.data.forEach(function(object) {
                        var found = false;
                        found = (object.scopes === 'assets:test') || found;
                        console.log('scopeseach', object.scopes);
                    });
                })
                .should.notify(done);
            });

            it('assets are retrieved sorted upwardly', function(done) {
                corbelDriver.assets().getAll({
                    sort: {
                        'name': 'asc'
                    }
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'name')).
                    to.be.equal(true);
                })
                .should.notify(done);
            });

            it('assets are retrieved sorted downwardly', function(done) {
                corbelDriver.assets().getAll({
                    sort: {
                        'name': 'desc'
                    }
                })
                .should.eventually.be.fulfilled
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'name')).
                    to.be.equal(true);
                })
                .should.notify(done);
            });
        });
    });
});