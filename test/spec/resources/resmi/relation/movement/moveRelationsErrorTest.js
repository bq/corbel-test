describe('In RESOURCES module', function() {

    describe('In RESMI module, testing moveRelation', function() {
        var corbelDriver;
        var TIMESTAMP = Date.now();
        var COLLECTION_A = 'test:CorbelJSOrderRelationA' + TIMESTAMP;
        var COLLECTION_B = 'test:CorbelJSOrderRelationB' + TIMESTAMP;
        var params = {
            sort: {
                '_order': 'asc'
            }
        };
        var amount = 3;
        var idResourceInA;
        var idsResourecesInB = [1, 2, 3];

        before(function() {
            corbelDriver = corbelTest.drivers['DEFAULT_CLIENT'].clone();
        });

        beforeEach(function(done) {
            corbelTest.common.resources.createdObjectsToQuery(corbelDriver, COLLECTION_A, 1)
                .then(function(id) {
                    idResourceInA = id[0];
                    return corbelTest.common.resources
                        .createRelationFromSingleObjetToMultipleObject(corbelDriver,
                            COLLECTION_A, idResourceInA, COLLECTION_B, idsResourecesInB);
                })
                .should.notify(done);
        });

        afterEach(function(done) {
            corbelTest.common.resources.cleanResourcesQuery(corbelDriver)
                .then(function() {
                    return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .delete();
                })
                .should.notify(done);
        });

        describe('a relation that does not have parameters', function() {

            it('move request returns a 400 error if position number is not specified',
                function(done) {
                    var idResource;

                    corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                        .get(null, params)
                        .then(function(response) {
                            expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                                .to.be.equal(true);
                            idResource = response.data[2].id;

                            return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                                .move(idResource)
                                .should.be.rejected;
                        })
                        .then(function(e) {
                            expect(e).to.have.property('status', 400);
                            expect(e).to.have.deep.property('data.error', 'bad_request');
                        })
                        .should.notify(done);
                });


            it('move request returns a 400 error if position number is 0', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .then(function(response) {
                        expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                            .to.be.equal(true);
                        idResource = response.data[2].id;

                        return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                            .move(idResource, 0)
                            .should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e).to.have.deep.property('data.error', 'bad_request');
                    })
                    .should.notify(done);
            });


            it('move request returns a 400 error if position number is -1', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .then(function(response) {
                        expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                            .to.be.equal(true);
                        idResource = response.data[2].id;

                        return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                            .move(idResource, -1)
                            .should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e).to.have.deep.property('data.error', 'bad_request');
                    })
                    .should.notify(done);
            });

            it('move request returns a 400 error if position number is a string', function(done) {
                var idResource;

                corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                    .get(null, params)
                    .then(function(response) {
                        expect(corbelTest.common.resources.checkSortingAsc(response.data, '_order'))
                            .to.be.equal(true);
                        idResource = response.data[2].id;

                        return corbelDriver.resources.relation(COLLECTION_A, idResourceInA, COLLECTION_B)
                            .move(idResource, 'invalidPositionString')
                            .should.be.rejected;
                    })
                    .then(function(e) {
                        expect(e).to.have.property('status', 400);
                        expect(e).to.have.deep.property('data.error', 'bad_request');
                    })
                    .should.notify(done);
            });

        });

    });
});
