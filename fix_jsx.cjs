const fs = require('fs');
let content = fs.readFileSync('src/components/Channels/ChannelsManager.tsx', 'utf-8');

// I inserted `</>` somewhere inappropriately. Let's find it.
const badClose = `              </div>\n            </div>\n\n            {/* Status / Settings Card */}\n            </>`;
if (content.includes(badClose)) {
  content = content.replace(badClose, `              </div>\n            </div>\n\n            {/* Status / Settings Card */}`);
  console.log("Fixed badClose");
}

const lastDivs = `                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Tab Content */}`;

// Let's replace the last divs to properly close the fragment
const correctLastDivs = `                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      )}

      {/* Telegram Tab Content */}`;

content = content.replace(lastDivs, correctLastDivs);
fs.writeFileSync('src/components/Channels/ChannelsManager.tsx', content);
