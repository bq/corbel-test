describe('In RESOURCES module', function() {

    describe('In RESMI module, testing relation queries, ', function() {

        describe('query language greater than with invalid format query', function() {
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

            it('400 invalid query is returned when querying for elems greater than empty array', function(done) {
                var params = {
                    query: [{
                        '$gt': {}
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e.data).to.have.property('error', 'invalid_query');
                })
                .should.notify(done);
            });

            it('no results are returned when querying for empty array', function(done) {
                var params = {
                    query: [{
                        '$in': {
                            ObjectNumber: []
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

            it('400 invalid query is returned if one of the filters used in the query is empty', function(done) {
                var params = {
                    queries: [{
                        query: [{
                            '$gt': {
                                intCount: 300
                            }
                        }]
                    }, {
                        query: [{
                            '$gt': {}
                        }]
                    }]
                };

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                .get(null, params)
                .should.be.rejected
                .then(function(e) {
                    expect(e).to.have.property('status', 400);
                    expect(e).to.have.deep.property('data.error', 'invalid_query');
                })
                .should.notify(done);
            });
        });
    });
});
