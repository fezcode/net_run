          <div className="text-3xl font-black text-white tracking-[0.3em] mb-4 border-b-2 border-cyan-500 pb-2 w-full text-center flex flex-col gap-1">
            <div>NET_RUN // LOG</div>
            {isDaily && <div className="text-[10px] tracking-[0.5em] text-cyan-500 opacity-80">{new Date().toISOString().split('T')[0]}</div>}
          </div>
