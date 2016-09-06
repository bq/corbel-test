describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries, ', function() {

        describe('query language exists', function() {
            var corbelDriver;
            var TIMESTAMP = Date.now();
            var COLLECTION_A = 'test:CorbelJSPaginationRelationA' + TIMESTAMP;
            var COLLECTION_B = 'test:CorbelJSPaginationRelationB' + TIMESTAMP;

            var amount = 5;
            var idResourceInA;
            var idsResourcesInB;

            before(function(done) {
                corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
                
                corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
                .then(function(id) {
                    idResourceInA = id[0];

                    return corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_B, amount);
                })
                .then(function(ids) {
                    idsResourcesInB = ids;

                    return corbelTest.common.resources.createRelationFromSingleObjetToMultipleObject
                    (corbelDriver, COLLECTION_A, idResourceInA, COLLECTION_B, idsResourcesInB);
                })
                .should.notify(done);
            });

            after(function(done) {
                corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .delete();
                })
                .should.notify(done);
            });

            it('elements where stringField exists are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            stringField: true
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.notify(done);
            });

            it('elements where stringField does not exist are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            stringField: false
                        }
                    }]
                };
                
                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });

            it('elements where notPresentField does not exist are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            notPresentField: false
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', amount);
                })
                .should.notify(done);
            });

            it('elements where notPresentField does not exist are returned', function(done) {
                var params = {
                    query: [{
                        '$exists': {
                            notPresentField: true
                        }
                    }]
                };

                corbelTest.common.resources.getRelation(corbelDriver, COLLECTION_A,
                    idResourceInA, COLLECTION_B, params)
                .then(function(response) {
                    expect(response).to.have.deep.property('data.length', 0);
                })
                .should.notify(done);
            });
        });
    });
});