// 测试FoApi连接和工具调用
async function testFoApi() {
    console.log('🔍 测试1: 基本连接');
    try {
        const response = await fetch('https://v2.voct.top/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fo-k2hNYh11vxGrpYB5tqRQSDArGY1Ynrs4'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: 'Hello'
                    }
                ],
                max_tokens: 50
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ FoApi基本连接成功!');
            console.log('响应:', data.choices[0].message.content);
        } else {
            console.log('❌ FoApi连接失败:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('错误详情:', errorText);
        }
    } catch (error) {
        console.log('❌ FoApi连接异常:', error.message);
    }

    console.log('\n🔍 测试2: 工具调用支持');
    try {
        const response = await fetch('https://v2.voct.top/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fo-k2hNYh11vxGrpYB5tqRQSDArGY1Ynrs4'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: '请调用get_weather工具获取北京的天气'
                    }
                ],
                tools: [
                    {
                        type: 'function',
                        function: {
                            name: 'get_weather',
                            description: '获取指定城市的天气信息',
                            parameters: {
                                type: 'object',
                                properties: {
                                    city: {
                                        type: 'string',
                                        description: '城市名称'
                                    }
                                },
                                required: ['city']
                            }
                        }
                    }
                ],
                tool_choice: 'auto',
                max_tokens: 100
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ FoApi工具调用测试成功!');
            console.log('响应:', JSON.stringify(data, null, 2));

            if (data.choices[0].message.tool_calls) {
                console.log('🎉 模型支持工具调用!');
            } else {
                console.log('⚠️ 模型可能不支持工具调用');
            }
        } else {
            console.log('❌ FoApi工具调用测试失败:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('错误详情:', errorText);
        }
    } catch (error) {
        console.log('❌ FoApi工具调用测试异常:', error.message);
    }
}

testFoApi();
