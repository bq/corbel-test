describe('In RESOURCES module', function() {
    var corbelDriver;
    var COLLECTION = 'test:CorbelJSObjectSortQuery' + Date.now();

    before(function() {
        corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
    });

    describe('In RESMI module, while testing sorting operation', function() {
        var amount = 10;

        beforeEach(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION, amount)
            .notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
            .notify(done);
        });

        describe('when get collection with sort asc order', function() {

            it('in a numeric field', function(done) {
                var params = {
                    sort: {
                        intField: 'asc'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'intField'))
                        .to.be.equal(true);
                })
                .notify(done);
            });

            it('in a string field', function(done) {
                var params = {
                    sort: {
                        stringField: 'asc'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'stringField'))
                        .to.be.equal(true);
                })
                .notify(done);
            });

            it('in a _updatedAt field', function(done) {
                var params = {
                    sort: {
                        _updatedAt: 'asc'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, '_updatedAt'))
                        .to.be.equal(true);
                })
                .notify(done);
            });

            it('in a numeric field and aplying query parameters', function(done) {
                var params = {
                    sort: {
                        stringField: 'asc'
                    },
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingAsc(response.data, 'stringField'))
                        .to.be.equal(true);
                    response.data.forEach(function(resource) {
                        expect(resource.intField).to.be.above(700);
                    });
                })
                .notify(done);
            });
        });

        describe('get collection with sort desc order', function() {

            it('in a numeric field', function(done) {
                var params = {
                    sort: {
                        intField: 'desc'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'intField'))
                        .to.be.equal(true);
                })
                .notify(done);
            });

            it('in a string field', function(done) {
                var params = {
                    sort: {
                        stringField: 'desc'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'stringField'))
                        .to.be.equal(true);
                })
                .notify(done);
            });

            it('in a _updatedAt field', function(done) {
                var params = {
                    sort: {
                        _updatedAt: 'desc'
                    }
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(response.data).have.length(amount);
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, '_updatedAt'))
                        .to.be.equal(true);
                })
                .notify(done);
            });

            it('in a numeric field and aplying query parameters', function(done) {
                var params = {
                    sort: {
                        stringField: 'desc'
                    },
                    query: [{
                        '$gt': {
                            intField: 700
                        }
                    }]
                };

                corbelDriver.resources.collection(COLLECTION)
                .get(params)
                .then(function(response) {
                    expect(corbelTest.common.resources.checkSortingDesc(response.data, 'stringField'))
                        .to.be.equal(true);
                    response.data.forEach(function(resource) {
                        expect(resource.intField).to.be.above(700);
                    });
                })
                .notify(done);
            });
        });
    });
});
