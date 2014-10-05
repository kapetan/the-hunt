/*
	[
		{
			"input": {
				"shoot": true
			},
			"sequence": 0,
			"bullet": {
				"hit": {
					"position": {
						"x": 449.45670109748676,
						"y": 301.48442554473877
					},
					"t": 1412498978577
				},
				"shoot": {
					"position": {
						"x": 49.89498329162598,
						"y": 301.48442554473877
					},
					"direction": 0
				}
			}
		},
		{
			"input": {
				"up": true
			},
			"sequence": 1
		},
		{
			"input": {
				"target": {
					"x": 350,
					"y": 200
				}
			},
			"sequence": 2
		}
	]
*/

module.exports = {
	type: 'array',
	items: {
		type: 'object',
		additionalProperties: false,
		properties: {
			sequence: {
				type: 'integer',
				required: true,
				minimum: 0
			},
			input: {
				type: 'object',
				required: true,
				additionalProperties: false,
				properties: {
					up: {
						type: 'boolean',
						required: false
					},
					down: {
						type: 'boolean',
						required: false
					},
					left: {
						type: 'boolean',
						required: false
					},
					right: {
						type: 'boolean',
						required: false
					},
					shoot: {
						type: 'boolean',
						required: false
					},
					target: {
						type: 'object',
						required: false,
						properties: {
							x: {
								type: 'number',
								required: true
							},
							y: {
								type: 'number',
								required: true
							}
						}
					}
				}
			},
			bullet: {
				type: 'object',
				required: false,
				additionalProperties: false,
				properties: {
					shoot: {
						type: 'object',
						required: true,
						additionalProperties: false,
						properties: {
							position: {
								type: 'object',
								required: true,
								additionalProperties: false,
								properties: {
									x: {
										type: 'number',
										required: true
									},
									y: {
										type: 'number',
										required: true
									}
								}
							},
							direction: {
								type: 'number',
								required: true
							}
						}
					},
					hit: {
						type: 'object',
						required: true,
						additionalProperties: false,
						properties: {
							position: {
								type: 'object',
								required: true,
								additionalProperties: false,
								properties: {
									x: {
										type: 'number',
										required: true
									},
									y: {
										type: 'number',
										required: true
									}
								}
							},
							body: {
								type: 'string',
								required: false
							},
							t: {
								type: 'integer',
								required: true
							}
						}
					}
				}
			}
		}
	}
};
