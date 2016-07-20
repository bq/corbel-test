describe('In ASSETS module', function() {
    describe('when getting an asset', function() {

        describe('while using an admin user', function() {
            var corbelDriver;

            before(function(){
                corbelDriver = corbelTest.drivers['ADMIN_USER'].clone();
            });

            it('assets are correctly retrieved with no params defined', function(done) {
                corbelDriver.assets.asset().getAll()
                .should.be.eventually.fulfilled
                .then(function(response){
                    expect(response).to.have.deep.property('data.length').not.equal(0);
                })
                .should.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to 1 at page 0', function(done) {
                corbelDriver.assets.asset().getAll({
                    query: [{
                        'name': 'assettest50'
                    }],
                    pagination: {
                        page: 0,
                        pageSize: corbelTest.CONFIG.GLOBALS.minPageSize
                    }
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', corbelTest.CONFIG.GLOBALS.minPageSize);
                })
                .should.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to default at page 1', function(done) {
                corbelDriver.assets.asset().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 1,
                        pageSize: corbelTest.CONFIG.GLOBALS.defaultPageSize
                    }
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', corbelTest.CONFIG.GLOBALS.defaultPageSize);
                })
                .should.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to 6 at page 2', function(done) {
                corbelDriver.assets.asset().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 2,
                        pageSize: 6
                    }
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 6);
                })
                .should.notify(done);
            });

            it('assets are correctly retrieved when pageSize is defined to maxPageSize at page 0', function(done) {
                corbelDriver.assets.asset().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 0,
                        pageSize: corbelTest.CONFIG.GLOBALS.maxPageSize
                    }
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', corbelTest.CONFIG.GLOBALS.maxPageSize);
                })
                .should.notify(done);
            });

            it('no assets are returned when trying to fech an invalid page', function(done) {
                corbelDriver.assets.asset().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 4,
                        pageSize: corbelTest.CONFIG.GLOBALS.maxPageSize
                    }
                })
                .should.be.eventually.fulfilled
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('server replies with an error when pageSize is over allowed value', function(done) {
                corbelDriver.assets.asset().getAll({
                    query: [{
                        'userId': 'fooid'
                    }],
                    pagination: {
                        page: 0,
                        pageSize: corbelTest.CONFIG.GLOBALS.maxPageSize + 1
                    }
                })
                .should.be.eventually.rejected
                .then(function(e) {
                    expect(e).to.have.deep.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_page_size');
                })
                .should.notify(done);
            });

        });
    });
});
